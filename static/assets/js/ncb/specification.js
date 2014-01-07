
function f(a,b,c) {
    this.a = a;
    this.b = b;
    this.c = c;
    
    this.print = function() {
        console.log("f: " + this.a + " " + this.b + " " + this.c);
    }
}

$().ready(function() {
    var x = new f(1,2,3);
    x.print();
    
});