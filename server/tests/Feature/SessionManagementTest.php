<?php

namespace Tests\Feature;

use App\Models\Session;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_select_username()
    {
        $response = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $response->assertNoContent();
        $response->assertCookie("session");
        $this->assertDatabaseHas('sessions', [
            "username" => "test_username",
        ]);
    }

    public function test_client_cannot_select_existing_username()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $response2 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $response2->assertStatus(400);
        $response2->assertCookieMissing("session");
    }

    public function test_client_cannot_select_empty_username()
    {
        $response = $this->post(route("users.select"));

        $response->assertInvalid("username");
    }

    public function test_session_expires_when_its_lifetime_is_over()
    {
        $response = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $this->travel(Session::LIFETIME)->minutes();

        $response->assertNoContent();
        $response->assertCookie("session");
        $response->assertCookieExpired("session");
        $this->assertDatabaseHas('sessions', [
            "username" => "test_username",
        ]);
    }

    public function test_session_is_destroyed_after_logout()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("users.logout"));

        $response2->assertNoContent();
        $response2->assertCookieExpired("session");
        $this->assertDatabaseMissing("sessions", [
            "username" => "test_username",
        ]);
    }
}
