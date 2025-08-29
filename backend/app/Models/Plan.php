<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_days',
        'max_beneficiaries',
        'max_employees',
        'features',
        'is_active',
    ];
    
    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
        'is_active' => 'boolean',
    ];
    
    // Relationships
    
    /**
     * Get all subscriptions for this plan.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
    
    /**
     * Get active subscriptions for this plan.
     */
    public function activeSubscriptions()
    {
        return $this->hasMany(Subscription::class)->where('status', 'active');
    }
    
    // Scopes
    
    /**
     * Scope to get only active plans.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    // Helper methods
    
    /**
     * Check if this plan allows unlimited beneficiaries.
     */
    public function hasUnlimitedBeneficiaries(): bool
    {
        return $this->max_beneficiaries === 0;
    }
    
    /**
     * Check if this plan allows unlimited employees.
     */
    public function hasUnlimitedEmployees(): bool
    {
        return $this->max_employees === 0;
    }
    
    /**
     * Get formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return '$' . number_format($this->price, 2);
    }
    
    /**
     * Get the plan's features as a formatted list.
     */
    public function getFormattedFeaturesAttribute(): array
    {
        return $this->features ?? [];
    }
}
