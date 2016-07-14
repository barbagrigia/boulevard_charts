defmodule BoulevardCharts.Template do
  require EEx


  template_filename = Path.join(__DIR__, "./templates/frame.html.eex")
  @external_resource template_filename
  EEx.function_from_file :def, :template, template_filename, []

  style_filename = Path.join(__DIR__, "./templates/app.css")
  @external_resource style_filename
  EEx.function_from_file :def, :styles, style_filename, []

  style_filename = Path.join(__DIR__, "./templates/app.js")
  @external_resource style_filename
  EEx.function_from_file :def, :scripts, style_filename, []
end
