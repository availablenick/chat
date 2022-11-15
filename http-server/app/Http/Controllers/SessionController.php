<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Http\Resources\SessionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    public function selectName(Request $request)
    {
        $validated = $request->validate([
            "username" => "required",
        ]);

        $session = Session::where("username", $validated["username"])->first();
        if ($session !== null) {
            $elapsedTime = now()->diffInMinutes($session->created_at);
            if ($elapsedTime >= Session::LIFETIME) {
                $session->delete();
            } else {
                abort(400);
            }
        }

        do {
            $session_id = Str::random(10);
        } while (Session::where("session_id", $session_id)->first() !== null);

        Session::create([
            "session_id" => $session_id,
            "username" => $validated["username"],
        ]);

        return response()->noContent()->cookie("session", $session_id, Session::LIFETIME);
    }

    public function index(Request $request)
    {
        $session_id = $request->cookie("session");
        $session = Session::where("session_id", $session_id)->first();
        if ($session === null) {
            abort(401);
        }

        return SessionResource::collection(Session::active()->get());
    }

    public function show(Request $request)
    {
        $session_id = $request->cookie("session");
        $session = Session::where("session_id", $session_id)->first();
        if ($session === null) {
            abort(401);
        }

        return response()->json([
            "user" => [
                "username" => $session->username,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $session_id = $request->cookie("session");
        $session = Session::where("session_id", $session_id)->first();
        if ($session !== null) {
            $session->delete();
        }

        return response()->noContent()->withoutCookie("session");
    }
}
