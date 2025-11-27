<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartItemController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        // Get or create user's cart
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        // Check if product exists and has enough stock
        $product = Product::find($request->product_id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        if ($product->stock < $request->quantity) {
            return response()->json([
                'message' => "Not enough stock. Only {$product->stock} available."
            ], 400);
        }

        // Check if item already exists in cart
        $cartItem = CartItem::where('cart_id', $cart->id)
                            ->where('product_id', $request->product_id)
                            ->first();

        if ($cartItem) {
            // Update existing item
            $newQuantity = $cartItem->quantity + $request->quantity;
            
            if ($newQuantity > $product->stock) {
                return response()->json([
                    'message' => "Cannot add more. Only {$product->stock} in stock."
                ], 400);
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // Create new cart item
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity
            ]);
        }

        return response()->json([
            'message' => 'Item added to cart successfully',
            'cart_item' => $cartItem->load('product')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = Cart::where('user_id', $user->id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cartItem = CartItem::where('id', $id)
                            ->where('cart_id', $cart->id)
                            ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        // Check stock
        $product = $cartItem->product;
        if ($request->quantity > $product->stock) {
            return response()->json([
                'message' => "Not enough stock. Only {$product->stock} available."
            ], 400);
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        return response()->json([
            'message' => 'Cart item updated successfully',
            'cart_item' => $cartItem->load('product')
        ]);
    }

    public function destroy($id)
    {
        $user = request()->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $cart = Cart::where('user_id', $user->id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cartItem = CartItem::where('id', $id)
                            ->where('cart_id', $cart->id)
                            ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart successfully']);
    }
}