<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// 路由
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
// 重定向到首页
Route::redirect('/', '/purchase', 301);

// 用户相关
Route::post('auth/login', 'API\PassportController@login');
Route::post('auth/register', 'Auth\RegisterController@register');
Route::post('auth/resetPassword', 'Auth\ResetPasswordController@resetPassword');
Route::post('auth/forgotPassword', 'Auth\ForgotPasswordController@forgotPassword');



Route::group(['middleware' => 'auth:api'], function(){
    Route::post('get-details', 'API\PassportController@getDetails');
});
