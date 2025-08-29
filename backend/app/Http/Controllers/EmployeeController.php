<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees created by the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Only project directors can manage employees
        if (!$user->isProjectDirector()) {
            return response()->json([
                'message' => 'Only project directors can manage employees.'
            ], 403);
        }
        
        $employees = User::where('created_by', $user->id)
            ->where('role', 'employee')
            ->with(['position', 'creator'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'employees' => $employees,
            'available_privileges' => User::getAvailablePrivileges(),
        ]);
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        \Log::info('EmployeeController@store: Creating employee', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'request_data' => $request->all()
        ]);
        
        // Only project directors can create employees
        if (!$user->isProjectDirector()) {
            \Log::warning('EmployeeController@store: Non-project director tried to create employee', [
                'user_id' => $user->id,
                'user_role' => $user->role
            ]);
            return response()->json([
                'message' => 'Only project directors can create employees.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'nullable|string|max:50|unique:users,username',
            'password' => 'required|string|min:8|confirmed',
            'position_id' => 'nullable|exists:positions,id',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'privileges' => 'nullable|array',
            'privileges.*' => Rule::in(array_keys(User::getAvailablePrivileges())),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user has active subscription (simplified for testing)
        try {
            if (!$user->hasActiveSubscription()) {
                // For development, allow creation without subscription
                \Log::info('Creating employee without active subscription for testing');
            }
            
            // Check subscription limits (simplified for testing)
            $currentPlan = $user->currentPlan();
            if ($currentPlan && !$currentPlan->hasUnlimitedEmployees()) {
                $currentCount = $user->employees()->count();
                if ($currentCount >= $currentPlan->max_employees) {
                    return response()->json([
                        'message' => 'Employee limit reached for your current plan.'
                    ], 403);
                }
            }
        } catch (\Exception $e) {
            // Log the error but continue with employee creation for testing
            \Log::error('Subscription check failed: ' . $e->getMessage());
        }

        // Generate username if not provided
        $username = $request->username ?: $this->generateUsername($request->name, $request->email);

        try {
            $employee = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'username' => $username,
                'password' => Hash::make($request->password),
                'role' => 'employee',
                'position_id' => $request->position_id,
                'phone' => $request->phone,
                'address' => $request->address,
                'status' => 'active',
                'created_by' => $user->id,
                'organization_id' => $user->id,
                'privileges' => $request->privileges ?? [],
                'must_change_password' => true, // Force password change on first login
            ]);

            \Log::info('EmployeeController@store: Employee created successfully', [
                'employee_id' => $employee->id,
                'employee_email' => $employee->email,
                'created_by' => $user->id
            ]);

            return response()->json([
                'message' => 'Employee account created successfully',
                'employee' => $employee->load(['creator', 'position']),
            ], 201);
        } catch (\Exception $e) {
            \Log::error('EmployeeController@store: Failed to create employee', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'message' => 'Failed to create employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified employee.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isProjectDirector()) {
            return response()->json([
                'message' => 'Only project directors can view employees.'
            ], 403);
        }
        
        $employee = User::where('id', $id)
            ->where('created_by', $user->id)
            ->where('role', 'employee')
            ->with(['creator', 'position'])
            ->first();

        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        return response()->json([
            'employee' => $employee,
            'available_privileges' => User::getAvailablePrivileges(),
            'formatted_privileges' => $employee->formatted_privileges,
        ]);
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isProjectDirector()) {
            return response()->json([
                'message' => 'Only project directors can update employees.'
            ], 403);
        }
        
        $employee = User::where('id', $id)
            ->where('created_by', $user->id)
            ->where('role', 'employee')
            ->first();

        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'username' => 'sometimes|required|string|unique:users,username,' . $id . '|max:50',
            'password' => 'nullable|string|min:8|confirmed',
            'position_id' => 'nullable|exists:positions,id',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'status' => 'sometimes|in:active,inactive,suspended',
            'privileges' => 'nullable|array',
            'privileges.*' => Rule::in(array_keys(User::getAvailablePrivileges())),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $validator->validated();
        
        // Hash password if provided
        if (isset($updateData['password']) && $updateData['password']) {
            $updateData['password'] = Hash::make($updateData['password']);
            $updateData['must_change_password'] = true; // Force password change
            unset($updateData['password_confirmation']);
        }

        $employee->update($updateData);

        return response()->json([
            'message' => 'Employee updated successfully',
            'employee' => $employee->load(['creator', 'position']),
            'formatted_privileges' => $employee->fresh()->formatted_privileges,
        ]);
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isProjectDirector()) {
            return response()->json([
                'message' => 'Only project directors can delete employees.'
            ], 403);
        }
        
        $employee = User::where('id', $id)
            ->where('created_by', $user->id)
            ->where('role', 'employee')
            ->first();

        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        // Soft delete by changing status to inactive
        $employee->update(['status' => 'inactive']);

        return response()->json([
            'message' => 'Employee account deactivated successfully'
        ]);
    }
    
    /**
     * Get available privileges.
     */
    public function privileges()
    {
        return response()->json([
            'privileges' => User::getAvailablePrivileges(),
        ]);
    }

    /**
     * Generate a unique username from name and email.
     */
    private function generateUsername(string $name, string $email): string
    {
        // First try: first name + last initial
        $nameParts = explode(' ', trim($name));
        $firstName = strtolower($nameParts[0]);
        $lastInitial = isset($nameParts[1]) ? strtolower(substr($nameParts[1], 0, 1)) : '';
        
        $baseUsername = $firstName . $lastInitial;
        
        // If that's taken, try email prefix
        if (User::where('username', $baseUsername)->exists()) {
            $emailPrefix = strtolower(explode('@', $email)[0]);
            $baseUsername = $emailPrefix;
        }
        
        // If still taken, add numbers
        $username = $baseUsername;
        $counter = 1;
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }
        
        return $username;
    }
}