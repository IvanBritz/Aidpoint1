<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $primaryKey = 'receipt_id';
    
    protected $fillable = [
        'user_id',
        'employee_id',
        'beneficiary_id',
        'receipt_number',
        'amount',
        'date',
        'vendor',
        'category',
        'description',
        'image_path',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id', 'beneficiary_id');
    }

    public function liquidations()
    {
        return $this->hasMany(Liquidation::class, 'receipt_id', 'receipt_id');
    }
}