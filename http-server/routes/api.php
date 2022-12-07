<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PrivateMessageController;
use App\Http\Controllers\SessionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::controller(SessionController::class)->group(function() {
    Route::post("/v1/select-username", "selectName")->name("users.select");
    Route::get("/v1/user-data", "show")->name("users.show");
    Route::post("/v1/logout", "logout")->name("users.logout");
});

Route::controller(MessageController::class)->group(function() {
    Route::post("/v1/messages", "store")->name("messages.store");
});

Route::controller(PrivateMessageController::class)->group(function() {
    Route::post("/v1/private-messages", "store")->name("private-messages.store");
});
