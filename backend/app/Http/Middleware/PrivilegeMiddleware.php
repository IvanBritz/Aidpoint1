<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PrivilegeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $privilege
     */
    public function handle(Request $request, Closure $next, string $privilege): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }
        
        if (!$user->hasPrivilege($privilege)) {
            return response()->json([
                'message' => 'Insufficient privileges. Required: ' . $privilege,
                'required_privilege' => $privilege,
                'user_privileges' => $user->privileges ?? [],
            ], 403);
        }
        
        return $next($request);
    }
}
