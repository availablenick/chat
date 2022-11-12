<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    const LIFETIME = 5;

    protected $fillable = [
        'session_id',
        'username',
    ];
}
