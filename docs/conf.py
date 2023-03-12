# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

import sys
import os
import re

from pygments_lexer_solidity import SolidityLexer

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.

ROOT_PATH = os.path.dirname(os.path.realpath(__file__))

sys.path.insert(0, os.path.join(ROOT_PATH, 'ext'))

def setup(sphinx):
    sphinx.add_lexer('Solidity', SolidityLexer)
    # sphinx.add_css_file('css/custom.css')

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'sphinx_a4doc',
    'sphinx.ext.autodoc',
]

a4_base_path = os.path.dirname(__file__) + '/grammar'

project = 'Ghost Envious NFTs'
copyright = '2023, GHOST chain'
author = 'GHOST chain'
release = '0.1.3'

# The name of the Pygments (syntax highlighting) style to use.
pygments_style = 'sphinx'

highlight_language = 'Solidity'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
#
# The short X.Y version.
#with open('../CMakeLists.txt', 'r', encoding='utf8') as f:
#    version = re.search('PROJECT_VERSION "([^"]+)"', f.read()).group(1)

# The full version, including alpha/beta/rc tags.
#if not os.path.isfile('../prerelease.txt') or os.path.getsize('../prerelease.txt') == 0:
#    release = version
#else:
#    # This is a prerelease version
#    release = version + '-develop'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

templates_path = ['_templates']
exclude_patterns = ['_build', 'grammar']


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

# Theme options are theme-specific and customize the look and feel of a theme
# further.  For a list of options available for each theme, see the
# documentation.
html_theme_options = {
    'logo_only': True,
    'style_nav_header_background': 'linear-gradient(90deg, rgba(20,50,82,1) 0%, rgba(47,88,133,1) 100%)',
    'display_version': True,
}

# The name of an image file (relative to this directory) to place at the top
# of the sidebar.
html_logo = "logo.svg"

# The name of an image file (within the static path) to use as favicon of the
# docs.  This file should be a Windows icon file (.ico) being 16x16 or 32x32
# pixels large.
html_favicon = "https://ipfs.io/ipfs/QmRgJ2UbzpM58te1R91bC2neWsS28F2QatBtzerM1JekyC"

# List of templates of static files to be included in the HTML output.
# Keys represent paths to input files and values are dicts containing:
# - target: The path where the rendered template should be placed.
# - context: A dictionary listing variables that can be used inside the template.
# All paths must be absolute.
# Rendered templates are automatically added to html_extra_path setting.
version = '0.1.3' # TODO replace
html_extra_templates = {
    os.path.join(ROOT_PATH, "robots.txt.template"): {
        'target': os.path.join(ROOT_PATH, "_static/robots.txt"),
        'context': {'LATEST_VERSION': version},
    }
}

# Grouping the document tree into LaTeX files. List of tuples
# (source start file, target name, title,
#  author, documentclass [howto, manual, or own class]).
latex_documents = [
    ('index', 'solidity.tex', 'Solidity Documentation', 'Ethereum', 'manual'),
]
