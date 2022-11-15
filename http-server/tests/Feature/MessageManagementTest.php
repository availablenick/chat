<?php

namespace Tests\Feature;

use App\Events\MessageSent;
use App\Listeners\SendMessageNotification;
use App\Models\Session;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class MessageManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_can_be_created()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"), ["content" => "test_content"]);

        $response2->assertNoContent();
        $this->assertDatabaseHas("messages", ["content" => "test_content"]);
    }

    public function test_message_cannot_be_created_by_unauthenticated_user()
    {
        $response = $this->post(route("messages.store"), [
            "content" => "test_content",
        ]);

        $response->assertUnauthorized();
    }

    public function test_message_cannot_be_created_without_content()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"));

        $response2->assertInvalid("content");
    }

    public function test_message_sent_event_is_emitted_after_message_creation()
    {
        Event::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"), ["content" => "test_content"]);

        Event::assertDispatched(MessageSent::class);
        Event::assertListening(MessageSent::class, SendMessageNotification::class);
    }
}
