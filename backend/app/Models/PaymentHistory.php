<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentHistory extends Model
{
    use HasFactory;

    protected $table = 'payment_history';
    protected $primaryKey = 'payment_id';
    
    protected $fillable = [
        'subscription_id',
        'payment_amount',
        'payment_date',
        'payment_method',
        'payment_status',
        'transaction_id',
        'invoice_number',
        'created_date',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'created_date' => 'datetime',
        'payment_amount' => 'decimal:2',
    ];

    public function subscription()
    {
        return $this->belongsTo(Subscription::class, 'subscription_id', 'subscription_id');
    }
}