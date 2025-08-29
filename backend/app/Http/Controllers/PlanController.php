<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Display a listing of active plans.
     */
    public function index()
    {
        $plans = Plan::active()->orderBy('price', 'asc')->get();
        
        return response()->json([
            'plans' => $plans,
        ]);
    }
}
