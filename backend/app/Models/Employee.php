<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Employee extends Model
{
    use HasFactory;

    protected $primaryKey = 'employee_id';
    
    /**
     * Custom timestamp column names
     */
    const CREATED_AT = 'created_date';
    const UPDATED_AT = 'last_modified_date';
    
    protected $fillable = [
        'user_id',
        'privilege_id',
        'first_name',
        'last_name',
        'email',
        'username',
        'phone',
        'address',
        'position',
        'employee_status',
        'hire_date',
        'salary',
        'created_date',
        'last_modified_date',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'created_date' => 'datetime',
        'last_modified_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function privilege()
    {
        return $this->belongsTo(Privilege::class, 'privilege_id', 'privilege_id');
    }

    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class, 'employee_id', 'employee_id');
    }

    public function aidRequests()
    {
        return $this->hasMany(AidRequest::class, 'employee_id', 'employee_id');
    }

    public function disbursements()
    {
        return $this->hasMany(Disbursement::class, 'processed_by', 'employee_id');
    }

    public function liquidations()
    {
        return $this->hasMany(Liquidation::class, 'processed_by', 'employee_id');
    }

    public function receipts()
    {
        return $this->hasMany(Receipt::class, 'employee_id', 'employee_id');
    }

    public function account()
    {
        return $this->hasOne(EmployeeAccount::class, 'employee_id', 'employee_id');
    }
}