<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConcernFeature extends Model
{
    use HasFactory;

    protected $primaryKey = 'concern_id';
    
    protected $fillable = [
        'user_id',
        'beneficiary_id',
        'employee_id',
        'concern_type',
        'description',
        'priority',
        'status',
        'created_date',
        'resolved_date',
        'resolved_by',
    ];

    protected $casts = [
        'created_date' => 'datetime',
        'resolved_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id', 'beneficiary_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}