<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search', '');

        $query = User::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('fullname', 'asc')->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fullname' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|max:50',
        ]);

        $user = User::create([
            'fullname' => $validated['fullname'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password'], // Hash cast will handle this
            'role' => $validated['role'] ?? 'user',
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
            'client' => $user // for frontend compatibility
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'fullname' => 'sometimes|required|string|max:255',
            'username' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'email' => [
                'sometimes', 'required', 'string', 'email', 'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'current_password' => 'required_with:password|string',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'role' => 'sometimes|nullable|string|max:50',
        ]);

        if (!empty($validated['password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
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

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user,
            'client' => $user // for frontend compatibility
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.'
        ]);
    }
}
