<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AidRequest extends Model
{
    use HasFactory;

    protected $primaryKey = 'aid_id';
    
    protected $fillable = [
        'beneficiary_id',
        'employee_id',
        'user_id',
        'request_type',
        'request_amount',
        'request_date',
        'request_status',
        'approval_date',
        'approved_by',
        'rejection_reason',
        'priority',
        'description',
    ];

    protected $casts = [
        'request_date' => 'date',
        'approval_date' => 'date',
        'request_amount' => 'decimal:2',
    ];

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id', 'beneficiary_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function disbursements()
    {
        return $this->hasMany(Disbursement::class, 'aid_id', 'aid_id');
    }

    public function liquidations()
    {
        return $this->hasMany(Liquidation::class, 'aid_id', 'aid_id');
    }
}