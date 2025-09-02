<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EmployeeAccount extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'employee_accounts';
    protected $primaryKey = 'employee_account_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'employee_account_id',
        'employee_id',
        'username',
        'password',
        'is_first_login',
        'must_change_password',
        'account_status',
        'last_login',
        'failed_login_attempts',
        'locked_until',
        'password_changed_at',
        'created_date',
        'last_modified_date',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_first_login' => 'boolean',
        'must_change_password' => 'boolean',
        'failed_login_attempts' => 'integer',
        'last_login' => 'datetime',
        'locked_until' => 'datetime',
        'password_changed_at' => 'datetime',
        'created_date' => 'datetime',
        'last_modified_date' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Get the employee that owns this account
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    /**
     * Check if account is locked
     */
    public function isLocked(): bool
    {
        return $this->account_status === 'Locked' || 
               ($this->locked_until && $this->locked_until->isFuture());
    }

    /**
     * Check if account is active
     */
    public function isActive(): bool
    {
        return $this->account_status === 'Active' && !$this->isLocked();
    }

    /**
     * Lock the account for a specified duration (in minutes)
     */
    public function lockAccount(int $minutes = 30): void
    {
        $this->update([
            'account_status' => 'Locked',
            'locked_until' => Carbon::now()->addMinutes($minutes),
            'last_modified_date' => Carbon::now(),
        ]);
    }

    /**
     * Unlock the account
     */
    public function unlockAccount(): void
    {
        $this->update([
            'account_status' => 'Active',
            'locked_until' => null,
            'failed_login_attempts' => 0,
            'last_modified_date' => Carbon::now(),
        ]);
    }

    /**
     * Increment failed login attempts
     */
    public function incrementFailedAttempts(): void
    {
        $attempts = $this->failed_login_attempts + 1;
        $this->update([
            'failed_login_attempts' => $attempts,
            'last_modified_date' => Carbon::now(),
        ]);

        // Lock account after 5 failed attempts
        if ($attempts >= 5) {
            $this->lockAccount();
        }
    }

    /**
     * Reset failed login attempts on successful login
     */
    public function resetFailedAttempts(): void
    {
        $this->update([
            'failed_login_attempts' => 0,
            'last_login' => Carbon::now(),
            'last_modified_date' => Carbon::now(),
        ]);
    }

    /**
     * Mark password as changed
     */
    public function markPasswordChanged(): void
    {
        $this->update([
            'is_first_login' => false,
            'must_change_password' => false,
            'password_changed_at' => Carbon::now(),
            'last_modified_date' => Carbon::now(),
        ]);
    }

    /**
     * Generate unique employee account ID
     */
    public static function generateEmployeeAccountId(): string
    {
        do {
            $id = 'EA' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('employee_account_id', $id)->exists());

        return $id;
    }

    /**
     * Get the employee's full name through relationship
     */
    public function getFullNameAttribute(): string
    {
        return $this->employee ? $this->employee->first_name . ' ' . $this->employee->last_name : '';
    }

    /**
     * Get employee's privileges through relationship
     */
    public function getPrivilegesAttribute()
    {
        return $this->employee && $this->employee->privilege ? [
            'privilege_id' => $this->employee->privilege->privilege_id,
            'privilege_name' => $this->employee->privilege->privilege_name,
            'aid_request_access' => $this->employee->privilege->aid_request_access,
            'disbursement_access' => $this->employee->privilege->disbursement_access,
            'liquidation_access' => $this->employee->privilege->liquidation_access,
            'audit_log_access' => $this->employee->privilege->audit_log_access,
            'monitoring_access' => $this->employee->privilege->monitoring_access,
            'receipts_access' => $this->employee->privilege->receipts_access,
        ] : null;
    }
}