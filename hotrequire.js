/**
 *
 * @copyright Copyright (c) 2011, {@link http://krnl.de Kai Dorschner}
 * @license http://www.gnu.org/licenses/gpl-3.0.html GNU General Public License Version 3 (GPL3)
 */

/**
 * Hot-loads a module into the context's scope.
 *
 * Hot-loading means that it'll reload the file into the variable when it's changed.
 *
 * @copyright Copyright (c) 2011, {@link http://krnl.de Kai Dorschner}
 * @license http://www.gnu.org/licenses/gpl-3.0.html GNU General Public License Version 3 (GPL3)
 * @category hotRequire
 * @package hotRequire
 * @author Kai Dorschner <the-kernel32@web.de>
 * @return void
 * @param string path Contains the path to the required module.
 * @param object context Context in which scope the module will be loaded in.
 * @param string varname Variable name inside the context to access the module.
 *
 * @todo make this function global
 */
function hotRequire(path, context, varname)
{
	var	  fs			= require('fs')
		, filename		= require.resolve(path) // resolved path (real path); needed to delete the cache properly.
		;

	context[varname] = require(filename); // load the contents into the context
	fs.watchFile(filename, function(current, previous) {
		if(current.nlink === 0) // path does not exist anymore
		{
			process.emit('removed', filename);
			delete require.cache[filename];
			fs.unwatchFile(filename);
			return;
		}

		if(current.mtime - previous.mtime) // if x > 0, has changed
		{
			process.emit('modified', filename);
			delete require.cache[filename]; // clear the cache (makes sure that the NEW file will be loaded)
			context[varname] = require(filename); // rebuild cache with new file immediately
			process.emit('reloaded', filename);
		}
	});
}

module.exports = exports = hotRequire;