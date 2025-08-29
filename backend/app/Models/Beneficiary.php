<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Beneficiary extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'created_by',
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'address',
        'gender',
        'national_id',
        'emergency_contact_name',
        'emergency_contact_phone',
        'financial_info',
        'documents',
        'status',
        'notes',
    ];
    
    protected $casts = [
        'date_of_birth' => 'date',
        'financial_info' => 'array',
        'documents' => 'array',
    ];
    
    // Relationships
    
    /**
     * Get the user account associated with this beneficiary.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    /**
     * Get the user who created this beneficiary profile.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    // Scopes
    
    /**
     * Scope to get only active beneficiaries.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
    
    /**
     * Scope to get beneficiaries by creator.
     */
    public function scopeByCreator($query, $creatorId)
    {
        return $query->where('created_by', $creatorId);
    }
    
    /**
     * Scope to get beneficiaries with user accounts.
     */
    public function scopeWithUserAccount($query)
    {
        return $query->whereNotNull('user_id');
    }
    
    /**
     * Scope to get beneficiaries without user accounts.
     */
    public function scopeWithoutUserAccount($query)
    {
        return $query->whereNull('user_id');
    }
    
    // Helper methods
    
    /**
     * Get full name.
     */
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }
    
    /**
     * Check if beneficiary has a user account.
     */
    public function hasUserAccount(): bool
    {
        return !is_null($this->user_id);
    }
    
    /**
     * Check if beneficiary is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
    
    /**
     * Get age from date of birth.
     */
    public function getAgeAttribute(): ?int
    {
        if (!$this->date_of_birth) {
            return null;
        }
        
        return $this->date_of_birth->age;
    }
    
    /**
     * Check if beneficiary profile is complete.
     */
    public function isProfileComplete(): bool
    {
        $requiredFields = [
            'first_name', 'last_name', 'email', 'phone', 
            'date_of_birth', 'address', 'emergency_contact_name', 
            'emergency_contact_phone'
        ];
        
        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get financial information as formatted data.
     */
    public function getFormattedFinancialInfoAttribute(): array
    {
        return $this->financial_info ?? [];
    }
    
    /**
     * Get uploaded documents.
     */
    public function getUploadedDocumentsAttribute(): array
    {
        return $this->documents ?? [];
    }
}
