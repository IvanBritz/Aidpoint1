<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $primaryKey = 'audit_id';
    
    protected $fillable = [
        'liquidation_id',
        'disbursement_id',
        'user_id',
        'action',
        'table_name',
        'record_id',
        'old_values',
        'new_values',
        'timestamp',
        'ip_address',
        'description',
    ];

    protected $casts = [
        'old_values' => 'json',
        'new_values' => 'json',
        'timestamp' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function liquidation()
    {
        return $this->belongsTo(Liquidation::class, 'liquidation_id', 'liquidation_id');
    }

    public function disbursement()
    {
        return $this->belongsTo(Disbursement::class, 'disbursement_id', 'disbursement_id');
    }
}