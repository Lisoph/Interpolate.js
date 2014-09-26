Interpolate.js
==============

A JavaScript library for interpolating between css rules.

## API

``` javascript
Interpol.Do({
  
  /* object is the target you want to interpolate. */
  object: myDivOrSpanOrWhatever,

  /* start is the css rule that describes your object's state at t=0 */
  start: ".my-white-object",

  /* end is the css rule that describes your object's state at t=1 */
  end: "#my-orange-object",

  /* time specifies how long the interpolation/animation should take */
  time: 1000, /* milliseconds */

  /*
    method is the function you want to use for interpolation.
    Interpolate.js supports 5 methods per se, take a look at src/methods.js
  */
  method: Interpol.Methods.Sin,

  /* Do you want to reverse the animation? */
  reverse: false,

  /* You can register some callbacks, if your heart desires so. */
  callbacks: {

    onFinish: function() { console.log("The animation just finished!"); },
    onProgress: function() {
      console.log("A newly rendered frame, fresh out of the oven.");
    }

  }
});
```

Alternatively to the *Interpol.methods.**, you could also write your own.
You just need to specify a function that takes 3 arguments: *x0*, *x1* and *t*.

***x0*** is the start property value, ***x1*** the end property value.
***t*** is the time (goes from 0.0 to 1.0).

Take a look at src/methods.js, to see how the built in functions are constructed.
A more in-depth API documentation will follow. Probably...

## Examples

See the [Interpolate.js test site](https://rawgit.com/Lisoph/Interpolate.js/master/test/test.html), it is fairly good demonstration.

## License

MIT - See the LICENSE file.

## Dependencies

~~[jQuery 1.11.0](http://jquery.com/)~~

## Note

This is an **experiment**, it might not get finished.
