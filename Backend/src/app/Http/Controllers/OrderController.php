<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $request->validate([
            'shipping_address' => 'required|string',
            'payment_type'     => 'required|in:Card,Cash On Delivery'
        ]);

        $cart = Cart::where('user_id', $user->id)->with('cartItems.product')->first();

        if (!$cart || $cart->cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        $totalAmount = 0;
        foreach ($cart->cartItems as $item) {
            if ($item->product) {
                $totalAmount += $item->product->price * $item->quantity;
            }
        }

        return DB::transaction(function () use ($user, $cart, $totalAmount, $request) {
            $order = Order::create([
                'user_id'          => $user->id,
                'total_amount'     => $totalAmount,
                'status'           => 'Pending',
                'payment_type'     => $request->payment_type,
                'shipping_address' => $request->shipping_address
            ]);

            foreach ($cart->cartItems as $item) {
                if ($item->product) {
                    OrderItem::create([
                        'order_id'          => $order->id,
                        'product_id'        => $item->product_id,
                        'quantity'          => $item->quantity,
                        'price_at_purchase' => $item->product->price
                    ]);
                }
            }

            CartItem::where('cart_id', $cart->id)->delete();

            return response()->json([
                'message'  => 'Order placed successfully!',
                'order_id' => $order->id
            ], 201);
        });
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        if ($user->is_admin) {
             $orders = Order::orderBy('created_at', 'desc')->with(['orderItems.product', 'user'])->get();
        } else {
             $orders = Order::where('user_id', $user->id)->orderBy('created_at', 'desc')->with('orderItems.product')->get();
        }
        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $query = Order::with('orderItems.product');

        if (!$user->is_admin) {
            $query->where('user_id', $user->id);
        }

        $order = $query->find($id);
        if (!$order) return response()->json(['message' => 'Order not found'], 404);

        return response()->json($order);
    }

    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $order = Order::where('id', $id);
        if (!$user->is_admin) {
            $order->where('user_id', $user->id);
        }
        $order = $order->first();

        if (!$order) return response()->json(['message' => 'Order not found'], 404);

        if ($order->status !== 'Pending' && $order->status !== 'Processing') {
            return response()->json(['message' => 'Order cannot be cancelled now.'], 400);
        }

        $order->update(['status' => 'Cancelled']);
        return response()->json(['message' => 'Order cancelled successfully']);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        if (!$user->is_admin) return response()->json(['message' => 'Forbidden: Admins only'], 403);

        $order = Order::find($id);
        if (!$order) return response()->json(['message' => 'Order not found'], 404);
        
        $request->validate(['status' => 'required|in:Pending,Processing,Shipped,Delivered,Cancelled']);
        $order->update(['status' => $request->status]);

        return response()->json(['message' => 'Order status updated', 'order' => $order]);
    }
}   