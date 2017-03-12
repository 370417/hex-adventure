// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
!function(a,b,c){function d(a){var b=this,c=g();b.next=function(){var a=2091639*b.s0+2.3283064365386963e-10*b.c;return b.s0=b.s1,b.s1=b.s2,b.s2=a-(b.c=0|a)},b.c=1,b.s0=c(" "),b.s1=c(" "),b.s2=c(" "),b.s0-=c(a),b.s0<0&&(b.s0+=1),b.s1-=c(a),b.s1<0&&(b.s1+=1),b.s2-=c(a),b.s2<0&&(b.s2+=1),c=null}function e(a,b){return b.c=a.c,b.s0=a.s0,b.s1=a.s1,b.s2=a.s2,b}function f(a,b){var c=new d(a),f=b&&b.state,g=c.next;return g.int32=function(){return 4294967296*c.next()|0},g["double"]=function(){return g()+1.1102230246251565e-16*(2097152*g()|0)},g.quick=g,f&&("object"==typeof f&&e(f,c),g.state=function(){return e(c,{})}),g}function g(){var a=4022871197,b=function(b){b=b.toString();for(var c=0;c<b.length;c++){a+=b.charCodeAt(c);var d=.02519603282416938*a;a=d>>>0,d-=a,d*=a,a=d>>>0,d-=a,a+=4294967296*d}return 2.3283064365386963e-10*(a>>>0)};return b}b&&b.exports?b.exports=f:c&&c.amd?c(function(){return f}):this.Alea=f}(this,"object"==typeof module&&module,"function"==typeof define&&define);