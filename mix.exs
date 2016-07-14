defmodule BoulevardCharts.Mixfile do
  use Mix.Project

  def project do
    [app: :boulevard_charts,
     version: "0.0.1",
     elixir: "~> 1.3",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps()]
  end

  # Configuration for the OTP application
  #
  # Type "mix help compile.app" for more information
  def application do
    [applications: [:logger]]
  end

  defp deps do
    [
      {:plug, "~> 1.1"}
    ]
  end
end
