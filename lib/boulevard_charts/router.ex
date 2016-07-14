defmodule BoulevardCharts.Router do
  @moduledoc """
  """

  use Plug.Router

  plug :match
  plug :dispatch

  get "/chart" do
    html_source = BoulevardCharts.Template.template()
    send_resp(conn, 200, html_source)
  end

  get "/chart-data.json" do
    data = Map.get(conn.private, :chart_module).handle_chart(conn.query_params)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, data)
  end
end
