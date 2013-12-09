
// return the methods copy from the clazz prototype methods

Custom.utils.copyMethods = function(clazz) {
	var rslt = {};
    for (key in clazz.prototype) {
        rslt[key] = clazz.prototype[key];
    }
    return rslt;
};