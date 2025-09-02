<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewRecommendation extends Model
{
    use HasFactory;

    protected $table = 'reviews_recommendations';
    protected $primaryKey = 'review_id';
    
    protected $fillable = [
        'user_id',
        'beneficiary_id',
        'employee_id',
        'related_table',
        'related_id',
        'description',
        'rating',
        'review_date',
        'status',
    ];

    protected $casts = [
        'review_date' => 'date',
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