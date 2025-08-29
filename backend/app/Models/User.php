<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'role',
        'position_id',
        'phone',
        'address',
        'status',
        'privileges',
        'created_by',
        'organization_id',
        'must_change_password',
        'password_changed_at',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'privileges' => 'array',
            'must_change_password' => 'boolean',
            'password_changed_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }
    
    // Available privileges for employees
    public const AVAILABLE_PRIVILEGES = [
        'aid_request' => 'Aid Request Management',
        'disbursement' => 'Financial Disbursements',
        'liquidation' => 'Liquidation Processing',
        'audit_log' => 'Audit Log Access',
        'beneficiary_management' => 'Beneficiary Management',
        'report_generation' => 'Report Generation',
    ];
    
    // Relationships
    
    /**
     * Get the subscription for the user (Project Director only).
     */
    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }
    
    /**
     * Get the active subscription for the user.
     */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active');
    }
    
    /**
     * Get all beneficiaries created by this user (Project Director).
     */
    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class, 'created_by');
    }
    
    /**
     * Get the beneficiary profile linked to this user.
     */
    public function beneficiaryProfile()
    {
        return $this->hasOne(Beneficiary::class, 'user_id');
    }
    
    /**
     * Get all employees created by this user (Project Director).
     */
    public function employees()
    {
        return $this->hasMany(User::class, 'created_by')->where('role', 'employee');
    }
    
    /**
     * Get the user who created this account.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    /**
     * Get the organization (Project Director) this user belongs to.
     */
    public function organization()
    {
        return $this->belongsTo(User::class, 'organization_id');
    }
    
    /**
     * Get the position of this user.
     */
    public function position()
    {
        return $this->belongsTo(Position::class);
    }
    
    /**
     * The privileges that belong to the user.
     */
    public function privilegesRelation(): BelongsToMany
    {
        return $this->belongsToMany(Privilege::class, 'user_privileges')
                    ->withPivot(['granted_at', 'granted_by'])
                    ->withTimestamps();
    }
    
    // Helper methods
    
    /**
     * Check if the user is a project director.
     */
    public function isProjectDirector(): bool
    {
        return $this->role === 'project_director';
    }
    
    
    /**
     * Check if the user is a beneficiary.
     */
    public function isBeneficiary(): bool
    {
        return $this->role === 'beneficiary';
    }
    
    /**
     * Check if the user is an employee.
     */
    public function isEmployee(): bool
    {
        return $this->role === 'employee';
    }
    
    /**
     * Check if the user has an active subscription.
     */
    public function hasActiveSubscription(): bool
    {
        return $this->activeSubscription()->exists();
    }
    
    
    /**
     * Get the user's current plan through their subscription.
     */
    public function currentPlan()
    {
        $subscription = $this->activeSubscription()->with('plan')->first();
        return $subscription ? $subscription->plan : null;
    }
    
    /**
     * Check if user has a specific privilege.
     */
    public function hasPrivilege(string $privilege): bool
    {
        if ($this->isProjectDirector()) {
            return true; // Project directors have all privileges
        }
        
        // Check relationship-based privileges first (new system)
        if ($this->privilegesRelation()->where('name', $privilege)->exists()) {
            return true;
        }
        
        // Fallback to JSON-based privileges (legacy system)
        return in_array($privilege, $this->privileges ?? []);
    }
    
    /**
     * Check if user has any of the given privileges.
     */
    public function hasAnyPrivilege(array $privileges): bool
    {
        if ($this->isProjectDirector()) {
            return true;
        }
        
        // Check relationship-based privileges first (new system)
        if ($this->privilegesRelation()->whereIn('name', $privileges)->exists()) {
            return true;
        }
        
        // Fallback to JSON-based privileges (legacy system)
        return !empty(array_intersect($privileges, $this->privileges ?? []));
    }
    
    /**
     * Get all available privileges.
     */
    public static function getAvailablePrivileges(): array
    {
        return self::AVAILABLE_PRIVILEGES;
    }
    
    /**
     * Get formatted privileges list.
     */
    public function getFormattedPrivilegesAttribute(): array
    {
        if (!$this->privileges) {
            return [];
        }
        
        return array_intersect_key(self::AVAILABLE_PRIVILEGES, array_flip($this->privileges));
    }
    
    /**
     * Check if user must change password.
     */
    public function mustChangePassword(): bool
    {
        return $this->must_change_password;
    }
    
    /**
     * Mark password as changed.
     */
    public function markPasswordChanged(): void
    {
        $this->update([
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);
    }
    
    // Privilege Management Methods
    
    /**
     * Grant a privilege to the user.
     */
    public function grantPrivilege(string $privilegeName, ?int $grantedBy = null): bool
    {
        $privilege = Privilege::where('name', $privilegeName)->first();
        if (!$privilege) {
            return false;
        }
        
        // Check if user already has this privilege
        if ($this->hasPrivilege($privilegeName)) {
            return true;
        }
        
        $this->privilegesRelation()->attach($privilege->id, [
            'granted_at' => now(),
            'granted_by' => $grantedBy,
        ]);
        
        return true;
    }
    
    /**
     * Revoke a privilege from the user.
     */
    public function revokePrivilege(string $privilegeName): bool
    {
        $privilege = Privilege::where('name', $privilegeName)->first();
        if (!$privilege) {
            return false;
        }
        
        $this->privilegesRelation()->detach($privilege->id);
        return true;
    }
    
    /**
     * Grant multiple privileges to the user.
     */
    public function grantPrivileges(array $privilegeNames, ?int $grantedBy = null): array
    {
        $results = [];
        foreach ($privilegeNames as $privilegeName) {
            $results[$privilegeName] = $this->grantPrivilege($privilegeName, $grantedBy);
        }
        return $results;
    }
    
    /**
     * Revoke multiple privileges from the user.
     */
    public function revokePrivileges(array $privilegeNames): array
    {
        $results = [];
        foreach ($privilegeNames as $privilegeName) {
            $results[$privilegeName] = $this->revokePrivilege($privilegeName);
        }
        return $results;
    }
    
    /**
     * Get all privilege names for the user.
     */
    public function getPrivilegeNames(): array
    {
        $relationshipPrivileges = $this->privilegesRelation->pluck('name')->toArray();
        $jsonPrivileges = $this->privileges ?? [];
        
        return array_unique(array_merge($relationshipPrivileges, $jsonPrivileges));
    }
    
    /**
     * Check if user has all of the given privileges.
     */
    public function hasAllPrivileges(array $privileges): bool
    {
        if ($this->isProjectDirector()) {
            return true;
        }
        
        foreach ($privileges as $privilege) {
            if (!$this->hasPrivilege($privilege)) {
                return false;
            }
        }
        
        return true;
    }
}
