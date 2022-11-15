<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\Session;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $session_id = $request->cookie("session");
        $session = Session::where("session_id", $session_id)->first();
        if ($session === null) {
            abort(401);
        }
        
        $validated = $request->validate([
            "content" => "required",
        ]);
        
        $message = Message::create([
            "author" => $session->username,
            "content" => $validated["content"],
        ]);
        
        MessageSent::dispatch($message);
        return response()->noContent();
    }
}
