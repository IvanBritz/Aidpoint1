<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Beneficiary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        // Debug: Log request details for CSRF troubleshooting
        \Log::info('Registration attempt', [
            'headers' => $request->headers->all(),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
        ]);
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:project_director,beneficiary',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            // For beneficiaries registering through beneficiary profile
            'beneficiary_profile_id' => 'nullable|exists:beneficiaries,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Special handling for beneficiary registration
        if ($request->role === 'beneficiary') {
            if (!$request->beneficiary_profile_id) {
                return response()->json([
                    'message' => 'Beneficiary profile ID is required for beneficiary registration.'
                ], 422);
            }
            
            $beneficiaryProfile = Beneficiary::find($request->beneficiary_profile_id);
            if (!$beneficiaryProfile || $beneficiaryProfile->hasUserAccount()) {
                return response()->json([
                    'message' => 'Invalid beneficiary profile or account already exists.'
                ], 422);
            }
            
            if ($beneficiaryProfile->email !== $request->email) {
                return response()->json([
                    'message' => 'Email must match the beneficiary profile email.'
                ], 422);
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'address' => $request->address,
            'status' => 'active',
        ]);

        // Link beneficiary profile to user account
        if ($request->role === 'beneficiary' && $request->beneficiary_profile_id) {
            $beneficiaryProfile = Beneficiary::find($request->beneficiary_profile_id);
            $beneficiaryProfile->user_id = $user->id;
            $beneficiaryProfile->status = 'active';
            $beneficiaryProfile->save();
            
            // Set organization_id to the creator of the beneficiary profile
            $user->organization_id = $beneficiaryProfile->created_by;
            $user->save();
        }

        // Create trial subscription for project directors
        if ($request->role === 'project_director') {
            $basicPlan = Plan::where('name', 'Basic Plan')->first();
            if ($basicPlan) {
                $trialEndDate = now()->addDays(30); // 1 month trial
                
                Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $basicPlan->id,
                    'start_date' => now(),
                    'end_date' => $trialEndDate,
                    'is_trial' => true,
                    'status' => 'active',
                    'amount_paid' => 0.00,
                    'trial_ends_at' => $trialEndDate,
                ]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user->load(['beneficiaryProfile', 'activeSubscription.plan']),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Account is not active'
            ], 401);
        }

        // Update last login time
        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load(['beneficiaryProfile', 'activeSubscription.plan', 'position']),
            'access_token' => $token,
            'token_type' => 'Bearer',
            'must_change_password' => $user->mustChangePassword(),
        ]);
    }

    /**
     * Change user password (for first-time password change).
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // Update password and mark as changed
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);
        
        $user->markPasswordChanged();

        return response()->json([
            'message' => 'Password changed successfully',
            'must_change_password' => false,
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }
}
