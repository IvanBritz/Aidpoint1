<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Privilege extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category',
    ];

    /**
     * The users that have this privilege.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_privileges')
                    ->withTimestamps();
    }
}
