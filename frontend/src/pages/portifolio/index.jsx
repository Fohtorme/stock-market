import React, { Component } from "react";
import Table from "../../components/table";
import AlphaVantage from "../../utils/apis/alphaVantage";
import J from "../../utils/apis/J";

class Portifolio extends Component {
  state = {
    portifolio: []
  };

  async componentDidMount() {
    let portifolio = [];
    const operacoes = await J.getOperations();
    operacoes.forEach(o => {
      let i = portifolio.findIndex(p => p.papel === o.papel);
      if (i === -1) {
        i = portifolio.length;
        portifolio.push({
          papel: o.papel,
          valorTotalInvestido: 0,
          quantidade: 0
        });
      }
      switch (o.operacao) {
        case "Compra":
          portifolio[i].valorTotalInvestido += o.valor * o.quantidade;
          portifolio[i].quantidade += o.quantidade;
          break;
        case "Venda":
          portifolio[i].valorTotalInvestido -= o.valor * o.quantidade;
          portifolio[i].quantidade -= o.quantidade;
          break;
        case "Dividendo":
          portifolio[i].valorTotalInvestido -= o.valor * o.quantidade;
          break;
      }
    });
    portifolio.forEach(p => {
      AlphaVantage.getCurrentQuote(p.papel).then(res => {
        const d = res.data;
        p.precoMedio = p.valorTotalInvestido / p.quantidade;
        p.valorTotalAtual = d.price * p.quantidade;
        p.precoAtual = d.price;
        p.ganhoTotal = (p.precoAtual - p.precoMedio) * p.quantidade;
        p.ganhoPercentual = (p.ganhoTotal / p.valorTotalInvestido) * 100;
        this.setState({ portifolio });
      });
    });
  }

  render() {
    const { portifolio } = this.state;
    return <Table id="portifolio" columns={columns} items={portifolio} />;
  }
}

export default Portifolio;

const columns = [
  { path: "papel", label: "papel", filter: true },
  { path: "quantidade", label: "quantidade" },
  { path: "valorTotalInvestido", label: "valorTotalInvestido" },
  { path: "valorTotalAtual", label: "valorTotalAtual" },
  { path: "precoMedio", label: "precoMedio" },
  { path: "precoAtual", label: "precoAtual" },
  { path: "ganhoTotal", label: "ganhoTotal" },
  { path: "ganhoPercentual", label: "ganhoPercentual" }
];
