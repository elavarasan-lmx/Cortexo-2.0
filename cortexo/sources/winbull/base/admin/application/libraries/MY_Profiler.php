<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * MY_Profiler — Custom Profiler Extension
 *
 * This is the CORRECT way to customize CI's Profiler.
 * Override methods here instead of editing system/libraries/Profiler.php.
 *
 * HOW TO USE:
 *   - Add custom sections to $_available_sections array below
 *   - Override any _compile_*() method to change its output
 *   - Enable in a controller: $this->output->enable_profiler(TRUE);
 *
 * CodeIgniter auto-loads this in preference to CI_Profiler.
 */
class MY_Profiler extends CI_Profiler
{
    public function __construct($config = array())
    {
        parent::__construct($config);
        // Add any custom initialization here
    }

    // ---------------------------------------------------------------
    // Add custom compile sections below when needed.
    // Example: override _compile_queries() to hide sensitive query data
    // in production environments.
    // ---------------------------------------------------------------

    /*
    protected function _compile_queries()
    {
        if (ENVIRONMENT === 'production') {
            return ''; // Hide queries in production
        }
        return parent::_compile_queries();
    }
    */
}
