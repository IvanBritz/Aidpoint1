<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BeneficiaryAccount extends Model
{
    use HasFactory;

    protected $primaryKey = 'baid';
    
    protected $fillable = [
        'beneficiary_id',
        'beneficiary_username',
        'beneficiary_password',
        'created_date',
        'last_login_date',
    ];

    protected $casts = [
        'created_date' => 'datetime',
        'last_login_date' => 'datetime',
    ];

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id', 'beneficiary_id');
    }
}