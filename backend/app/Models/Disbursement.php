<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disbursement extends Model
{
    use HasFactory;

    protected $primaryKey = 'disbursement_id';
    
    protected $fillable = [
        'aid_id',
        'disbursement_amount',
        'disbursement_date',
        'disbursement_method',
        'processed_by',
        'status',
        'transaction_reference',
    ];

    protected $casts = [
        'disbursement_date' => 'date',
        'disbursement_amount' => 'decimal:2',
    ];

    public function aidRequest()
    {
        return $this->belongsTo(AidRequest::class, 'aid_id', 'aid_id');
    }

    public function processedByEmployee()
    {
        return $this->belongsTo(Employee::class, 'processed_by', 'employee_id');
    }

    public function liquidations()
    {
        return $this->hasMany(Liquidation::class, 'disbursement_id', 'disbursement_id');
    }
}