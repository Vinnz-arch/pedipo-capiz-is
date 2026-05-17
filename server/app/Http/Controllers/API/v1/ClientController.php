<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        return response()->json(Client::orderBy('fullname', 'asc')->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fullname' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:clients',
            'email' => 'required|string|email|max:255|unique:clients',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|max:50',
        ]);

        $client = Client::create([
            'fullname' => $validated['fullname'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password'], // Hash cast will handle this
            'role' => $validated['role'] ?? 'client',
        ]);

        return response()->json([
            'message' => 'Client created successfully.',
            'client' => $client
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        return response()->json($client);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'fullname' => 'sometimes|required|string|max:255',
            'username' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('clients')->ignore($client->id),
            ],
            'email' => [
                'sometimes', 'required', 'string', 'email', 'max:255',
                Rule::unique('clients')->ignore($client->id),
            ],
            'current_password' => 'required_with:password|string',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'role' => 'sometimes|nullable|string|max:50',
        ]);

        if (!empty($validated['password'])) {
            if (!Hash::check($validated['current_password'], $client->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The provided current password does not match our records.'],
                ]);
            }
        }

        if (empty($validated['password'])) {
            unset($validated['password']);
        }
        
        unset($validated['current_password']);
        unset($validated['password_confirmation']);

        $client->update($validated);

        return response()->json([
            'message' => 'Client updated successfully.',
            'client' => $client
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return response()->json([
            'message' => 'Client deleted successfully.'
        ]);
    }
}
