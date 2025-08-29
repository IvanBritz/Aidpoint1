<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'plan_id',
        'start_date',
        'end_date',
        'is_trial',
        'status',
        'amount_paid',
        'payment_method',
        'payment_reference',
        'trial_ends_at',
        'payment_details',
    ];
    
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_trial' => 'boolean',
        'amount_paid' => 'decimal:2',
        'trial_ends_at' => 'datetime',
        'payment_details' => 'array',
    ];
    
    // Relationships
    
    /**
     * Get the user that owns the subscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the plan for this subscription.
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
    
    // Scopes
    
    /**
     * Scope to get only active subscriptions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
    
    /**
     * Scope to get only trial subscriptions.
     */
    public function scopeTrial($query)
    {
        return $query->where('is_trial', true);
    }
    
    /**
     * Scope to get expired subscriptions.
     */
    public function scopeExpired($query)
    {
        return $query->where('end_date', '<', now())
                    ->where('status', '!=', 'cancelled');
    }
    
    // Helper methods
    
    /**
     * Check if subscription is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->end_date >= now()->toDateString();
    }
    
    /**
     * Check if subscription is in trial period.
     */
    public function isInTrial(): bool
    {
        return $this->is_trial && $this->trial_ends_at && $this->trial_ends_at > now();
    }
    
    /**
     * Check if subscription is expired.
     */
    public function isExpired(): bool
    {
        return $this->end_date < now()->toDateString();
    }
    
    /**
     * Get days remaining in subscription.
     */
    public function daysRemaining(): int
    {
        if ($this->isExpired()) {
            return 0;
        }
        
        return now()->diffInDays($this->end_date, false);
    }
    
    /**
     * Get trial days remaining.
     */
    public function trialDaysRemaining(): int
    {
        if (!$this->isInTrial()) {
            return 0;
        }
        
        return now()->diffInDays($this->trial_ends_at, false);
    }
    
    /**
     * Extend subscription by given days.
     */
    public function extend(int $days): void
    {
        $this->end_date = Carbon::parse($this->end_date)->addDays($days);
        $this->save();
    }
    
    /**
     * Cancel subscription.
     */
    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }
    
    /**
     * Activate subscription.
     */
    public function activate(): void
    {
        $this->status = 'active';
        $this->save();
    }
}
