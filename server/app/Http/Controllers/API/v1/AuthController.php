<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function login(Request $request)
    {
        // 1 validate the incoming request
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'recaptcha_token' => 'required|string',
        ]);

        // 2. Verify reCAPTCHA token
        $secretKey = config('services.recaptcha.secret');
        $isLocal = app()->environment('local', 'development');
        
        // Determine if we should bypass verification (Local environment + Missing/Mock key)
        $shouldBypass = $isLocal && (empty($secretKey) || $secretKey === 'mock_secret' || $request->recaptcha_token === 'debug');

        if ($shouldBypass) {
            \Log::info('reCAPTCHA verification bypassed (Local/Dev environment).');
        } else {
            // Production or Local with keys configured: Perform strict verification
            if (empty($secretKey)) {
                \Log::critical('reCAPTCHA configuration error: Secret Key is missing in a non-local environment.');
                
                throw ValidationException::withMessages([
                    'recaptcha_token' => ['Server security configuration error. Please contact the administrator.'],
                ]);
            }

            try {
                $response = Http::asForm()->timeout(10)->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $secretKey,
                    'response' => $request->recaptcha_token,
                    'remoteip' => $request->ip(),
                ]);

                $responseData = $response->json();

                if (!$response->successful() || !($responseData['success'] ?? false)) {
                    \Log::warning('reCAPTCHA verification failed', [
                        'response' => $responseData,
                        'ip' => $request->ip()
                    ]);

                    throw ValidationException::withMessages([
                        'recaptcha_token' => ['The CAPTCHA verification failed. Please try again.'],
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('reCAPTCHA connection error: ' . $e->getMessage());
                throw ValidationException::withMessages([
                    'recaptcha_token' => ['Unable to connect to security verification service. Please try again later.'],
                ]);
            }
        }

        // 3. Find the user by email

        // 3. Find the user by email
        $user = User::where('email', $request->email)->first();

        // 3. Securely check the password
        // We use Hash::check to compare the plain text password with the hashed one in the DB
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // 4. Generate a secure token for this user
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Return the token and user info
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * Log out the user and revoke the token.
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
