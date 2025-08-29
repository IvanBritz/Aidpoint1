<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PositionController extends Controller
{
    /**
     * Get list of all positions.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isProjectDirector()) {
            return response()->json([
                'message' => 'Only project directors can access positions.'
            ], 403);
        }
        
        $positions = Position::orderBy('name')->get();
        
        return response()->json([
            'positions' => $positions->pluck('name')->toArray(), // For backwards compatibility
            'positions_full' => $positions, // Full position data with IDs
        ]);
    }
    
    /**
     * Create a new position.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isProjectDirector()) {
            return response()->json([
                'message' => 'Only project directors can create positions.'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:positions,name',
            'description' => 'nullable|string|max:500',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $position = Position::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);
        
        return response()->json([
            'message' => 'Position created successfully',
            'position' => $position->name, // For backwards compatibility 
            'position_full' => $position, // Full position data
        ], 201);
    }
    
    /**
     * Update a position.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isProjectDirector()) {
            return response()->json([
                'message' => 'Only project directors can update positions.'
            ], 403);
        }
        
        $position = Position::find($id);
        if (!$position) {
            return response()->json([
                'message' => 'Position not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:positions,name,' . $id,
            'description' => 'nullable|string|max:500',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $position->update($validator->validated());
        
        return response()->json([
            'message' => 'Position updated successfully',
            'position' => $position->fresh(),
        ]);
    }
    
    /**
     * Delete a position.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isProjectDirector()) {
            return response()->json([
                'message' => 'Only project directors can delete positions.'
            ], 403);
        }
        
        $position = Position::find($id);
        if (!$position) {
            return response()->json([
                'message' => 'Position not found'
            ], 404);
        }
        
        // Check if position is in use
        if ($position->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete position that is assigned to employees.'
            ], 409);
        }
        
        $position->delete();
        
        return response()->json([
            'message' => 'Position deleted successfully'
        ]);
    }
}