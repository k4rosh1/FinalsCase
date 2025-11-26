<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; 

class CategoryFactory extends Factory
{
    public function definition(): array
    {
      
        $groceryDepts = [
            'Produce', 
            'Dairy & Eggs', 
            'Meat & Seafood', 
            'Bakery', 
            'Beverages', 
            'Frozen Foods', 
            'Pantry Staples',
            'Snacks',
            'Household',
            'Personal Care'
        ];
        
    
        $name = fake()->unique()->randomElement($groceryDepts);

        return [
            'category_name' => $name,
            'slug' => Str::slug($name),                         
            'image_url' => fake()->imageUrl(640, 480, 'food', true)
        ];
    }
}