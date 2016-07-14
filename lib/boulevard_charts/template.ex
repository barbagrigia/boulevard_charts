defmodule BoulevardCharts.Template do
  require EEx

  template_filename = Path.join(__DIR__, "./templates/frame.html.eex")
  EEx.function_from_file :def, :template, template_filename, []

  style_filename = Path.join(__DIR__, "./templates/charts.css")
  EEx.function_from_file :def, :styles, style_filename, []

  style_filename = Path.join(__DIR__, "./templates/scripts.js")
  EEx.function_from_file :def, :scripts, style_filename, []
end
