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

        $response2->assertStatus(422);
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

    public function test_session_data_can_be_retrieved()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->get(route("users.show"));

        $response2->assertOk();
        $response2->assertJson([
            "user" => [
                "username" => "test_username",
            ],
        ]);
    }

    public function test_session_data_cannot_be_retrieved_by_unauthenticated_user()
    {
        $response = $this->get(route("users.show"));

        $response->assertUnauthorized();
    }

    public function test_users_with_active_sessions_can_be_retrieved()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $this->travel(Session::LIFETIME)->minutes();
        $response2 = $this->post(route("users.select"), [
            "username" => "test_username2",
        ]);
        
        $session = Session::where("username", "test_username2")->first();
        $response3 = $this
            ->withCookie("session", $session->session_id)
            ->get(route("users.index"));

        $response3->assertOk();
        $response3->assertJson([
            "data" => [
                ["username" => "test_username2"],
            ],
        ]);
    }

    public function test_unauthenticated_user_cannot_retrieve_users_with_active_sessions()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this->get(route("users.index"));

        $response2->assertUnauthorized();
    }
}
