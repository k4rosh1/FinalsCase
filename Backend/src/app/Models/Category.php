<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_name',
        'slug',
        'image_url'
    ];

    // Add this to ensure image_url is always returned in JSON
    protected $appends = ['name', 'imageUrl'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // Accessors for frontend compatibility
    public function getNameAttribute()
    {
        return $this->category_name;
    }

    public function getImageUrlAttribute()
    {
        return $this->attributes['image_url'] ?? '/img/placeholder.png';
    }
}