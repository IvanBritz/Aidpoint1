<?php

/*
|--------------------------------------------------------------------------
| Privilege System Usage Examples
|--------------------------------------------------------------------------
|
| This file demonstrates how to use the new privilege system in your routes.
| These are example routes that show different ways to apply privilege middleware.
|
*/

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExampleController;

/*
|--------------------------------------------------------------------------
| Single Privilege Examples
|--------------------------------------------------------------------------
*/

// Require 'manage_users' privilege
Route::middleware(['auth:sanctum', 'privilege:manage_users'])->group(function () {
    Route::get('/admin/users', [ExampleController::class, 'listUsers']);
    Route::post('/admin/users', [ExampleController::class, 'createUser']);
    Route::put('/admin/users/{id}', [ExampleController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [ExampleController::class, 'deleteUser']);
});

// Require 'view_applications' privilege
Route::middleware(['auth:sanctum', 'privilege:view_applications'])->group(function () {
    Route::get('/applications', [ExampleController::class, 'listApplications']);
    Route::get('/applications/{id}', [ExampleController::class, 'viewApplication']);
});

// Require 'approve_applications' privilege
Route::middleware(['auth:sanctum', 'privilege:approve_applications'])->group(function () {
    Route::post('/applications/{id}/approve', [ExampleController::class, 'approveApplication']);
    Route::post('/applications/{id}/reject', [ExampleController::class, 'rejectApplication']);
});

// Require 'cash_disbursement' privilege
Route::middleware(['auth:sanctum', 'privilege:cash_disbursement'])->group(function () {
    Route::post('/disbursements', [ExampleController::class, 'createDisbursement']);
    Route::put('/disbursements/{id}/process', [ExampleController::class, 'processDisbursement']);
});

// Require 'auditlog' privilege
Route::middleware(['auth:sanctum', 'privilege:auditlog'])->group(function () {
    Route::get('/audit-logs', [ExampleController::class, 'viewAuditLogs']);
});

/*
|--------------------------------------------------------------------------
| Controller-level Privilege Examples
|--------------------------------------------------------------------------
| 
| You can also apply privilege middleware at the controller level:
|
| class ApplicationController extends Controller
| {
|     public function __construct()
|     {
|         $this->middleware('auth:sanctum');
|         $this->middleware('privilege:view_applications')->only(['index', 'show']);
|         $this->middleware('privilege:create_applications')->only(['store']);
|         $this->middleware('privilege:approve_applications')->only(['approve', 'reject']);
|         $this->middleware('privilege:edit_applications')->only(['update']);
|     }
| }
|
*/

/*
|--------------------------------------------------------------------------
| Manual Privilege Checking Examples
|--------------------------------------------------------------------------
|
| You can also check privileges manually in your controllers:
|
| public function someAction(Request $request)
| {
|     $user = $request->user();
|     
|     // Check single privilege
|     if (!$user->hasPrivilege('manage_users')) {
|         abort(403, 'Insufficient privileges');
|     }
|     
|     // Check multiple privileges (any)
|     if (!$user->hasAnyPrivilege(['create_applications', 'edit_applications'])) {
|         abort(403, 'Need either create or edit privileges');
|     }
|     
|     // Check multiple privileges (all)
|     if (!$user->hasAllPrivileges(['view_applications', 'approve_applications'])) {
|         abort(403, 'Need both view and approve privileges');
|     }
|     
|     // Project directors always have all privileges
|     if ($user->isProjectDirector()) {
|         // This user can do anything
|     }
| }
|
*/

/*
|--------------------------------------------------------------------------
| Privilege Management Examples
|--------------------------------------------------------------------------
|
| You can grant and revoke privileges programmatically:
|
| // Grant a privilege
| $user->grantPrivilege('manage_users', $currentUser->id);
|
| // Revoke a privilege
| $user->revokePrivilege('manage_users');
|
| // Grant multiple privileges
| $user->grantPrivileges(['view_applications', 'create_applications'], $currentUser->id);
|
| // Revoke multiple privileges
| $user->revokePrivileges(['view_applications', 'create_applications']);
|
| // Get all privilege names for a user
| $privileges = $user->getPrivilegeNames();
|
*/
