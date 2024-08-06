<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class DashBoardController extends Controller
{
    public function noofproject(Request $request)
    {
        $data = DB::table('projecttbl')->count();
        error_log(print_r($data, true));

        return response([
            'count' => $data,
        ]);
    }
}
