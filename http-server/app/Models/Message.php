<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    const TEXT_TYPE = 0;
    const IMAGE_TYPE = 1;
    const VIDEO_TYPE = 2;

    protected $fillable = [
        'author',
        'content',
        'type',
    ];
}
