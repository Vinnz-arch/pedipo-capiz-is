<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Admin;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Enforce role-based access control across Admin, Staff, and Portal Users.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $authenticated = $request->user();

        if (! $authenticated) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $effectiveRole = match (true) {
            $authenticated instanceof Admin => UserRole::ADMIN->value,
            $authenticated instanceof User => $authenticated->isStaff()
                ? UserRole::STAFF->value
                : UserRole::USER->value,
            default => null,
        };

        if (! $effectiveRole || ! in_array($effectiveRole, $roles, true)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}
