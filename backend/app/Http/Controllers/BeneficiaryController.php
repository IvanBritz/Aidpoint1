<?php

namespace App\Http\Controllers;

use App\Models\Beneficiary;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class BeneficiaryController extends Controller
{
    /**
     * Display a listing of beneficiaries created by the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $beneficiaries = Beneficiary::where('created_by', $user->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'beneficiaries' => $beneficiaries,
        ]);
    }

    /**
     * Store a newly created beneficiary profile.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:beneficiaries,email',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string|max:500',
            'gender' => 'nullable|in:male,female,other',
            'national_id' => 'nullable|string|max:50',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'financial_info' => 'nullable|array',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Check if user has active subscription
        if (!$user->hasActiveSubscription()) {
            return response()->json([
                'message' => 'Active subscription required to create beneficiary profiles.'
            ], 403);
        }
        
        // Check subscription limits
        $currentPlan = $user->currentPlan();
        if ($currentPlan && !$currentPlan->hasUnlimitedBeneficiaries()) {
            $currentCount = $user->beneficiaries()->count();
            if ($currentCount >= $currentPlan->max_beneficiaries) {
                return response()->json([
                    'message' => 'Beneficiary limit reached for your current plan.'
                ], 403);
            }
        }

        $beneficiary = Beneficiary::create(array_merge(
            $validator->validated(),
            ['created_by' => $user->id]
        ));

        return response()->json([
            'message' => 'Beneficiary profile created successfully',
            'beneficiary' => $beneficiary->load('creator'),
        ], 201);
    }

    /**
     * Display the specified beneficiary.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $beneficiary = Beneficiary::where('id', $id)
            ->where('created_by', $user->id)
            ->with(['user', 'creator'])
            ->first();

        if (!$beneficiary) {
            return response()->json([
                'message' => 'Beneficiary not found'
            ], 404);
        }

        return response()->json([
            'beneficiary' => $beneficiary,
        ]);
    }

    /**
     * Update the specified beneficiary.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        $beneficiary = Beneficiary::where('id', $id)
            ->where('created_by', $user->id)
            ->first();

        if (!$beneficiary) {
            return response()->json([
                'message' => 'Beneficiary not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:beneficiaries,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string|max:500',
            'gender' => 'nullable|in:male,female,other',
            'national_id' => 'nullable|string|max:50',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'financial_info' => 'nullable|array',
            'status' => 'sometimes|in:pending,active,inactive,suspended',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $beneficiary->update($validator->validated());

        return response()->json([
            'message' => 'Beneficiary updated successfully',
            'beneficiary' => $beneficiary->load(['user', 'creator']),
        ]);
    }

    /**
     * Remove the specified beneficiary.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        $beneficiary = Beneficiary::where('id', $id)
            ->where('created_by', $user->id)
            ->first();

        if (!$beneficiary) {
            return response()->json([
                'message' => 'Beneficiary not found'
            ], 404);
        }

        // If beneficiary has a user account, deactivate it instead of deleting
        if ($beneficiary->hasUserAccount()) {
            $beneficiary->user->status = 'inactive';
            $beneficiary->user->save();
        }
        
        $beneficiary->delete();

        return response()->json([
            'message' => 'Beneficiary deleted successfully'
        ]);
    }
    
    /**
     * Get beneficiary's own profile (for beneficiary users).
     */
    public function myProfile(Request $request)
    {
        $user = $request->user();
        
        $beneficiary = $user->beneficiaryProfile;
        
        if (!$beneficiary) {
            return response()->json([
                'message' => 'Beneficiary profile not found'
            ], 404);
        }
        
        return response()->json([
            'beneficiary' => $beneficiary->load('creator'),
        ]);
    }
    
    /**
     * Update beneficiary's own profile (for beneficiary users).
     */
    public function updateMyProfile(Request $request)
    {
        $user = $request->user();
        
        $beneficiary = $user->beneficiaryProfile;
        
        if (!$beneficiary) {
            return response()->json([
                'message' => 'Beneficiary profile not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'financial_info' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $beneficiary->update($validator->validated());
        
        return response()->json([
            'message' => 'Profile updated successfully',
            'beneficiary' => $beneficiary->load('creator'),
        ]);
    }
}
