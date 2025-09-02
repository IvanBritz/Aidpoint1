<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Liquidation extends Model
{
    use HasFactory;

    protected $primaryKey = 'liquidation_id';
    
    protected $fillable = [
        'aid_id',
        'disbursement_id',
        'receipt_id',
        'receipt_amount',
        'receipt_date',
        'liquidation_status',
        'submitted_date',
        'processed_by',
        'notes',
    ];

    protected $casts = [
        'receipt_date' => 'date',
        'submitted_date' => 'date',
        'receipt_amount' => 'decimal:2',
    ];

    public function aidRequest()
    {
        return $this->belongsTo(AidRequest::class, 'aid_id', 'aid_id');
    }

    public function disbursement()
    {
        return $this->belongsTo(Disbursement::class, 'disbursement_id', 'disbursement_id');
    }

    public function receipt()
    {
        return $this->belongsTo(Receipt::class, 'receipt_id', 'receipt_id');
    }

    public function processedByEmployee()
    {
        return $this->belongsTo(Employee::class, 'processed_by', 'employee_id');
    }
}