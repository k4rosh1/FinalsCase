
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; 
use App\Models\Category;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        // 1. CHANGE: Generate Realistic Grocery Names
        // Instead of random "Lorem Ipsum", we mix Adjectives + Nouns.
        $adjectives = ['Organic', 'Fresh', 'Premium', 'Local', 'Frozen', 'Dried', 'Spicy', 'Sweet', 'Green', 'Red'];
        $nouns = ['Apples', 'Bananas', 'Carrots', 'Potatoes', 'Tomatoes', 'Milk', 'Cheese', 'Beef', 'Chicken', 'Rice', 'Bread', 'Eggs', 'Garlic', 'Onions'];
        
        $name = fake()->randomElement($adjectives) . ' ' . fake()->randomElement($nouns) . ' ' . fake()->unique()->numberBetween(100, 999);

        return [
            'product_name' => $name,
            'slug' => Str::slug($name), 
            
            'price' => fake()->randomFloat(2, 1, 50), 
            'stock' => fake()->numberBetween(0, 200),
            
            'is_active' => true,
            'description' => fake()->sentence(10),
            'category_id' => Category::factory(), 
            
            'image_url'=> fake()->imageUrl(640, 480, 'food', true),
        ];
    }
}