import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Separator } from "@/components/ui/separator.jsx";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion.jsx";
import {
  Plus,
  Trash2,
  FileText,
  Calculator,
  User,
  Zap,
  Camera,
  Folder,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { services, categories } from "./data/services.js";
const logoRaizEletrica = "/logo-raizeletrica-atualizada-sem-fundo.png";
import { problemasEletricos, outrosProblemas } from "./data/problems.js";
import "./App.css";
import ElectricBackground from "@/components/electric-background.jsx";

const isBrowser = typeof window !== "undefined";

function App() {
  // Utilitário para carregar imagem como base64
  const getBase64Logo = async () => {
    if (
      !isBrowser ||
      typeof fetch !== "function" ||
      typeof FileReader === "undefined"
    ) {
      return null;
    }

    try {
      const response = await fetch(logoRaizEletrica);
      if (!response.ok) {
        throw new Error(`Erro ao carregar logo: ${response.status}`);
      }

      const blob = await response.blob();

      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Não foi possível carregar a logo: ", error);
      return null;
    }
  };
  // Estados principais
  const [currentTab, setCurrentTab] = useState("cliente");
  const [cliente, setCliente] = useState({
    nome: "",
    contato: "",
    endereco: "",
  });
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [servicosManuais, setServicosManuais] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [novoServicoManual, setNovoServicoManual] = useState({
    nome: "",
    descricao: "",
    quantidade: "",
    preco_unitario: "",
  });
  const [novoMaterial, setNovoMaterial] = useState({
    descricao: "",
    quantidade: "",
    preco_unitario: "",
  });
  const [despesasExtras, setDespesasExtras] = useState([]);
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: "",
    valor: "",
  });
  const [arquivosObservacoes, setArquivosObservacoes] = useState([]);
  const [problemasEletricosSelecionados, setProblemasEletricosSelecionados] =
    useState([]);
  const [outrosProblemasSelecionados, setOutrosProblemasSelecionados] =
    useState([]);
  const [descricaoRelatorio, setDescricaoRelatorio] = useState("");
  const [fotosRelatorio, setFotosRelatorio] = useState([]);
  const [servicosRelatorioSelecionados, setServicosRelatorioSelecionados] =
    useState([]);
  const [servicosRelatorioManuais, setServicosRelatorioManuais] = useState([]);
  const [novoServicoRelatorioManual, setNovoServicoRelatorioManual] = useState({
    nome: "",
    descricao: "",
    quantidade: "",
    unidade: "un",
    fotos: [],
  });
  const [desconto, setDesconto] = useState(0);

  const [arquivos, setArquivos] = useState(() => {
    if (!isBrowser) {
      return {};
    }

    try {
      const saved = window.localStorage.getItem("arquivos");
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach((key) => {
        const entry = parsed[key] || {};
        if (!Array.isArray(entry.orcamentos)) entry.orcamentos = [];
        if (!Array.isArray(entry.relatorios)) entry.relatorios = [];
        parsed[key] = entry;
      });
      return parsed;
    } catch (error) {
      console.error("Não foi possível carregar os arquivos salvos:", error);
      return {};
    }
  });
  const [buscaArquivo, setBuscaArquivo] = useState("");

  const salvarArquivo = (clienteNome, tipo, pdf, nome) => {
    const key = clienteNome || "Sem nome";


    setArquivos((prevArquivos) => {
      const novos = { ...(prevArquivos || {}) };

      if (!novos[key]) {
        novos[key] = { orcamentos: [], relatorios: [] };
      }

      if (!Array.isArray(novos[key][tipo])) {
        novos[key][tipo] = [];
      }

      novos[key][tipo].push({
        data: new Date().toLocaleDateString("pt-BR"),
        pdf,
        nome,
      });

      if (isBrowser) {
        const persist = () =>
          window.localStorage.setItem("arquivos", JSON.stringify(novos));

        try {
          persist();
        } catch (e) {
          if (e.name === "QuotaExceededError") {
            console.warn("Armazenamento cheio, removendo arquivos antigos...");
            while (novos[key][tipo].length > 1) {
              novos[key][tipo].shift();
              try {
                persist();
                break;
              } catch (err) {
                if (err.name !== "QuotaExceededError") throw err;
              }
            }
            try {
              persist();
            } catch (err) {
              console.error(
                "Não há espaço suficiente no armazenamento para salvar o arquivo",
                err
              );
            }
          } else {
            console.error("Erro ao salvar arquivo:", e);
          }
        }
      }
      return novos;

    });
  };

  const removerArquivo = (clienteNome, tipo, index) => {
    setArquivos((prev) => {
      const novos = { ...prev };
      if (!novos[clienteNome]) return prev;
      novos[clienteNome][tipo].splice(index, 1);
      if (
        novos[clienteNome].orcamentos.length === 0 &&
        novos[clienteNome].relatorios.length === 0
      ) {
        delete novos[clienteNome];
      }
      if (isBrowser) {
        window.localStorage.setItem("arquivos", JSON.stringify(novos));
      }
      return novos;
    });
  };

  const adicionarDespesaExtra = () => {
    if (!novaDespesa.descricao || !novaDespesa.valor) return;
    setDespesasExtras([
      ...despesasExtras,
      { ...novaDespesa, id: Date.now(), valor: parseFloat(novaDespesa.valor) },
    ]);
    setNovaDespesa({ descricao: "", valor: "" });
  };

  const removerDespesaExtra = (id) => {
    setDespesasExtras(despesasExtras.filter((d) => d.id !== id));
  };

  const calcularAcrescimoPorItem = () => {
    const totalExtras = despesasExtras.reduce((acc, d) => acc + d.valor, 0);
    const quantidadeTotal = [...servicosSelecionados, ...servicosManuais].reduce(
      (acc, s) => acc + (parseFloat(s.quantidade) || 0),
      0
    );
    return quantidadeTotal > 0 ? totalExtras / quantidadeTotal : 0;
  };

  const handleUploadObservacoes = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArquivosObservacoes((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            nome: file.name,
            tipo: file.type,
            base64: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // Função para adicionar/remover serviços selecionados
  const toggleServico = (servico) => {
    const existe = servicosSelecionados.find((s) => s.id === servico.id);
    if (existe) {
      setServicosSelecionados(
        servicosSelecionados.filter((s) => s.id !== servico.id)
      );
    } else {
      setServicosSelecionados([
        ...servicosSelecionados,
        {
          ...servico,
          preco_unitario: servico.preco_padrao,
          quantidade: 1,
          observacoes: "",
        },
      ]);
    }
  };

  const adicionarServico = (servico) => {
    setServicosSelecionados((prevSelecionados) => {
      if (prevSelecionados.some((item) => item.id === servico.id)) {
        return prevSelecionados;
      }

      return [
        ...prevSelecionados,
        {
          ...servico,
          preco_unitario: servico.preco_padrao,
          quantidade: 1,
          observacoes: "",
        },
      ];
    });
  };

  // Função para atualizar preço de um serviço selecionado
  const atualizarPrecoServico = (id, novoPreco) => {
    setServicosSelecionados(
      servicosSelecionados.map((s) =>
        s.id === id ? { ...s, preco_unitario: parseFloat(novoPreco) || 0 } : s
      )
    );
  };

  // Função para atualizar quantidade de um serviço selecionado
  const atualizarQuantidadeServico = (id, novaQuantidade) => {
    setServicosSelecionados(
      servicosSelecionados.map((s) =>
        s.id === id ? { ...s, quantidade: parseFloat(novaQuantidade) || 0 } : s
      )
    );
  };

  // Função para atualizar observações de um serviço selecionado
  const atualizarObservacoesServico = (id, observacoes) => {
    setServicosSelecionados(
      servicosSelecionados.map((s) => (s.id === id ? { ...s, observacoes } : s))
    );
  };

  // Função para adicionar serviço manual
  const adicionarServicoManual = () => {
    if (
      novoServicoManual.nome &&
      novoServicoManual.quantidade &&
      novoServicoManual.preco_unitario
    ) {
      setServicosManuais([
        ...servicosManuais,
        {
          id: Date.now().toString(),
          nome: novoServicoManual.nome,
          descricao: novoServicoManual.descricao,
          quantidade: parseFloat(novoServicoManual.quantidade) || 0,
          preco_unitario: parseFloat(novoServicoManual.preco_unitario) || 0,
        },
      ]);
      setNovoServicoManual({
        nome: "",
        descricao: "",
        quantidade: "",
        preco_unitario: "",
      });
    }
  };

  // Função para remover serviço manual
  const removerServicoManual = (id) => {
    setServicosManuais(servicosManuais.filter((s) => s.id !== id));
  };

  // Função para adicionar material
  const adicionarMaterial = () => {
    if (novoMaterial.descricao && novoMaterial.quantidade && novoMaterial.preco_unitario) {
      setMateriais([
        ...materiais,
        {
          id: Date.now().toString(),
          descricao: novoMaterial.descricao,
          quantidade: parseFloat(novoMaterial.quantidade) || 0,
          preco_unitario: parseFloat(novoMaterial.preco_unitario) || 0,
        },
      ]);
      setNovoMaterial({ descricao: "", quantidade: "", preco_unitario: "" });
    }
  };

  // Função para remover material
  const removerMaterial = (id) => {
    setMateriais(materiais.filter((m) => m.id !== id));
  };

  // Funções para serviços do relatório
  const toggleServicoRelatorio = (servico) => {
    const existe = servicosRelatorioSelecionados.find(
      (s) => s.id === servico.id
    );
    if (existe) {
      setServicosRelatorioSelecionados(
        servicosRelatorioSelecionados.filter((s) => s.id !== servico.id)
      );
    } else {
      setServicosRelatorioSelecionados([
        ...servicosRelatorioSelecionados,
        { ...servico, quantidade: 1, descricao: "", fotos: [] },
      ]);
    }
  };

  const atualizarQuantidadeServicoRelatorio = (id, novaQuantidade) => {
    setServicosRelatorioSelecionados(
      servicosRelatorioSelecionados.map((s) =>
        s.id === id ? { ...s, quantidade: parseFloat(novaQuantidade) || 0 } : s
      )
    );
  };

  const atualizarDescricaoServicoRelatorio = (id, descricao) => {
    setServicosRelatorioSelecionados(
      servicosRelatorioSelecionados.map((s) =>
        s.id === id ? { ...s, descricao } : s
      )
    );
  };

  const adicionarFotoServicoRelatorio = (id, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServicosRelatorioSelecionados((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, fotos: [...(s.fotos || []), reader.result] }
              : s
          )
        );
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleFotoNovoServicoRelatorioManual = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovoServicoRelatorioManual((prev) => ({
          ...prev,
          fotos: [...(prev.fotos || []), reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const adicionarServicoRelatorioManual = () => {
    if (
      novoServicoRelatorioManual.nome &&
      novoServicoRelatorioManual.quantidade
    ) {
      setServicosRelatorioManuais([
        ...servicosRelatorioManuais,
        {
          id: Date.now().toString(),
          nome: novoServicoRelatorioManual.nome,
          descricao: novoServicoRelatorioManual.descricao,
          quantidade: parseFloat(novoServicoRelatorioManual.quantidade) || 0,
          unidade: novoServicoRelatorioManual.unidade || "un",
          fotos: novoServicoRelatorioManual.fotos || [],
        },
      ]);
      setNovoServicoRelatorioManual({
        nome: "",
        descricao: "",
        quantidade: "",
        unidade: "un",
        fotos: [],
      });
    }
  };

  const removerServicoRelatorioManual = (id) => {
    setServicosRelatorioManuais(
      servicosRelatorioManuais.filter((s) => s.id !== id)
    );
  };

  // Funções para relatório
  const toggleSelecao = (item, lista, setLista) => {
    const existe = lista.find((p) => p.problema === item);
    if (existe) {
      setLista(lista.filter((p) => p.problema !== item));
    } else {
      setLista([...lista, { problema: item, descricao: "", fotos: [] }]);
    }
  };

  const atualizarDescricaoProblema = (item, descricao, lista, setLista) => {
    setLista(lista.map((p) => (p.problema === item ? { ...p, descricao } : p)));
  };

  const adicionarFotoProblema = (item, e, lista, setLista) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLista((prev) =>
          prev.map((p) =>
            p.problema === item
              ? { ...p, fotos: [...(p.fotos || []), reader.result] }
              : p
          )
        );
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const adicionarFotoRelatorio = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotosRelatorio((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), src: reader.result, descricao: "" },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const atualizarDescricaoFoto = (id, descricao) => {
    setFotosRelatorio(
      fotosRelatorio.map((f) => (f.id === id ? { ...f, descricao } : f))
    );
  };

  const calcularSubtotalMaoDeObra = () => {
    const totalServicos = servicosSelecionados.reduce(
      (acc, s) => acc + s.preco_unitario * s.quantidade,
      0
    );
    const totalManuais = servicosManuais.reduce(
      (acc, s) => acc + s.preco_unitario * s.quantidade,
      0
    );
    const totalExtras = despesasExtras.reduce((acc, d) => acc + d.valor, 0);
    return totalServicos + totalManuais + totalExtras;
  };

  const calcularSubtotalMateriais = () => {
    return materiais.reduce(
      (acc, m) => acc + m.preco_unitario * m.quantidade,
      0
    );
  };

  const calcularTotal = () => {
    return calcularSubtotalMaoDeObra() + calcularSubtotalMateriais();
  };

  const addWrappedText = (
    doc,
    text,
    x,
    y,
    maxWidth = 180,
    lineHeight = 6
  ) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  const addImageWithCaption = (
    doc,
    image,
    caption,
    x,
    y,
    maxWidth = 180,
    lineHeight = 6
  ) => {
    try {
      const props = doc.getImageProperties(image);
      const w = maxWidth;
      const h = (props.height * w) / props.width;
      if (y + h > 280) {
        doc.addPage();
        y = 20;
      }
      doc.addImage(image, props.fileType || "JPEG", x, y, w, h);
      y += h + 4;
      if (caption) {
        const lines = doc.splitTextToSize(caption, maxWidth);
        if (y + lines.length * lineHeight > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(lines, x, y);
        y += lines.length * lineHeight + 4;
      }
      return y;
    } catch (e) {
      console.error("Erro ao adicionar imagem:", e);
      return y;
    }
  };

  // Função auxiliar para adicionar a logo em todas as páginas do PDF
  const adicionarLogoEmTodasAsPaginas = async (doc) => {
    const logoBase64 = await getBase64Logo();
    if (!logoBase64) return doc;

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.addImage(logoBase64, "PNG", 150, 10, 40, 40);
    }
    return doc;
  };

  // Função para gerar orçamento
  const gerarOrcamento = async () => {
    if (!cliente.nome) {
      alert(
        "Por favor, preencha o nome do cliente antes de gerar o orçamento."
      );
      return;
    }
    const subtotalMaoDeObra = calcularSubtotalMaoDeObra();
    const subtotalMateriais = calcularSubtotalMateriais();
    const subtotal = subtotalMaoDeObra + subtotalMateriais;
    const valorTotal = subtotal * (1 - desconto / 100);
    const acrescimo = calcularAcrescimoPorItem();
    const orcamento = {
      cliente,
      servicosSelecionados,
      servicosManuais,
      materiais,
      observacoesGerais,
      desconto,
      subtotalMaoDeObra,
      subtotalMateriais,
      subtotal,
      valorTotal,
      despesasExtras,
      acrescimo,
      dataCriacao: new Date().toLocaleDateString("pt-BR"),
      arquivosObservacoes,
    };

    console.log("Orçamento gerado:", orcamento);

    // Documento de serviços (mão de obra)
    const docServicos = new jsPDF();
    docServicos.setFontSize(18);
    docServicos.text("Orçamento de Serviços Elétricos - Mão de Obra", 14, 20);
    docServicos.setFontSize(12);
    let yServ = 30;
    yServ = addWrappedText(
      docServicos,
      `Cliente: ${orcamento.cliente.nome}`,
      14,
      yServ
    );
    yServ = addWrappedText(
      docServicos,
      `Contato: ${orcamento.cliente.contato}`,
      14,
      yServ
    );
    if (orcamento.cliente.endereco) {
      yServ = addWrappedText(
        docServicos,
        `Endereço: ${orcamento.cliente.endereco}`,
        14,
        yServ
      );
    }
    yServ = addWrappedText(
      docServicos,
      `Data: ${orcamento.dataCriacao}`,
      14,
      yServ
    );

    autoTable(docServicos, {
      startY: yServ + 10,
      head: [["Serviço", "Qtd", "Descrição", "Valor"]],
      body: [...orcamento.servicosSelecionados, ...orcamento.servicosManuais].map(
        (s) => [
          s.nome,
          s.quantidade,
          s.descricao || "",
          `R$ ${((s.preco_unitario + acrescimo) * s.quantidade).toFixed(2)}`,
        ]
      ),
    });
    let finalY = docServicos.lastAutoTable
      ? docServicos.lastAutoTable.finalY
      : yServ + 10;
    docServicos.text(
      `Subtotal Mão de Obra: R$ ${subtotalMaoDeObra.toFixed(2)}`,
      14,
      finalY + 10
    );
    finalY += 16;

    if (observacoesGerais) {
      const obsText = docServicos.splitTextToSize(
        `Observações: ${observacoesGerais}`,
        180
      );
      docServicos.text(obsText, 14, finalY + 10);
      finalY += obsText.length * 10;
    }

    if (arquivosObservacoes.length > 0) {
      let y = finalY + 10;
      arquivosObservacoes.forEach((arq) => {
        if (arq.tipo.startsWith("image/")) {
          y = addImageWithCaption(docServicos, arq.base64, arq.nome, 14, y);
        } else {
          const linhasArq = docServicos.splitTextToSize(arq.nome, 180);
          if (y + linhasArq.length * 6 > 280) {
            docServicos.addPage();
            y = 20;
          }
          docServicos.text(linhasArq, 14, y);
          y += linhasArq.length * 6;
        }
      });
      finalY = y;
    }

    docServicos.setFontSize(14);
    const totalMaoDeObraComDesconto = subtotalMaoDeObra * (1 - desconto / 100);
    if (desconto > 0) {
      docServicos.text(
        `Subtotal: R$ ${subtotalMaoDeObra.toFixed(2)}`,
        14,
        finalY + 20
      );
      docServicos.text(
        `Desconto (${desconto}%): -R$ ${(subtotalMaoDeObra - totalMaoDeObraComDesconto).toFixed(2)}`,
        14,
        finalY + 27
      );
      docServicos.text(
        `Total: R$ ${totalMaoDeObraComDesconto.toFixed(2)}`,
        14,
        finalY + 34
      );
    } else {
      docServicos.text(
        `Total: R$ ${subtotalMaoDeObra.toFixed(2)}`,
        14,
        finalY + 20
      );
    }

    const pdfServicos = docServicos.output("datauristring");
    salvarArquivo(
      orcamento.cliente.nome,
      "orcamentos",
      pdfServicos,
      `orcamento-servicos-${orcamento.cliente.nome || "cliente"}.pdf`
    );
    await adicionarLogoEmTodasAsPaginas(docServicos);
    docServicos.save(
      `orcamento-servicos-${orcamento.cliente.nome || "cliente"}.pdf`
    );

    // Documento de materiais
    if (materiais.length > 0) {
      const docMateriais = new jsPDF();
      docMateriais.setFontSize(18);
      docMateriais.text("Orçamento de Materiais", 14, 20);
      docMateriais.setFontSize(12);
      let yMat = 30;
      yMat = addWrappedText(
        docMateriais,
        `Cliente: ${orcamento.cliente.nome}`,
        14,
        yMat
      );
      yMat = addWrappedText(
        docMateriais,
        `Contato: ${orcamento.cliente.contato}`,
        14,
        yMat
      );
      if (orcamento.cliente.endereco) {
        yMat = addWrappedText(
          docMateriais,
          `Endereço: ${orcamento.cliente.endereco}`,
          14,
          yMat
        );
      }
      yMat = addWrappedText(
        docMateriais,
        `Data: ${orcamento.dataCriacao}`,
        14,
        yMat
      );

      autoTable(docMateriais, {
        startY: yMat + 10,
        head: [["Material", "Qtd", "Valor"]],
        body: materiais.map((m) => [
          m.descricao,
          m.quantidade,
          `R$ ${(m.preco_unitario * m.quantidade).toFixed(2)}`,
        ]),
      });
      let finalYMat = docMateriais.lastAutoTable
        ? docMateriais.lastAutoTable.finalY
        : yMat + 10;
      docMateriais.text(
        `Subtotal Materiais: R$ ${subtotalMateriais.toFixed(2)}`,
        14,
        finalYMat + 10
      );
      finalYMat += 16;

      if (observacoesGerais) {
        const obsTextMat = docMateriais.splitTextToSize(
          `Observações: ${observacoesGerais}`,
          180
        );
        docMateriais.text(obsTextMat, 14, finalYMat + 10);
        finalYMat += obsTextMat.length * 10;
      }

      if (arquivosObservacoes.length > 0) {
        let y = finalYMat + 10;
        arquivosObservacoes.forEach((arq) => {
          if (arq.tipo.startsWith("image/")) {
            y = addImageWithCaption(docMateriais, arq.base64, arq.nome, 14, y);
          } else {
            const linhasArq = docMateriais.splitTextToSize(arq.nome, 180);
            if (y + linhasArq.length * 6 > 280) {
              docMateriais.addPage();
              y = 20;
            }
            docMateriais.text(linhasArq, 14, y);
            y += linhasArq.length * 6;
          }
        });
      }

      const pdfMateriais = docMateriais.output("datauristring");
      salvarArquivo(
        orcamento.cliente.nome,
        "orcamentos",
        pdfMateriais,
        `orcamento-materiais-${orcamento.cliente.nome || "cliente"}.pdf`
      );
      await adicionarLogoEmTodasAsPaginas(docMateriais);
      docMateriais.save(
        `orcamento-materiais-${orcamento.cliente.nome || "cliente"}.pdf`
      );
    }

    alert("Orçamentos gerados em PDF com sucesso!");
  };

  // Função para gerar relatório
  const gerarRelatorio = async () => {
    console.log("Iniciando geração do relatório...");

    if (!cliente.nome) {
      alert(
        "Por favor, preencha o nome do cliente antes de gerar o relatório."
      );
      return;
    }

    try {
      console.log("Criando documento PDF...");
      const doc = new jsPDF();

      console.log("Carregando logo...");
      const logoBase64 = await getBase64Logo();

      if (logoBase64) {
        console.log("Logo carregada com sucesso");
        doc.addImage(logoBase64, "PNG", 150, 10, 40, 40);
      } else {
        console.log("Logo não foi carregada");
      }

      // Adiciona informações básicas do relatório
      doc.setFontSize(18);
      doc.text("Relatório de Inspeção", 14, 20);
      doc.setFontSize(12);
      let y = 30;
      y = addWrappedText(
        doc,
        `Cliente: ${cliente.nome}`,
        14,
        y
      );
      y = addWrappedText(
        doc,
        `Data: ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        y
      );
      y += 10;

      // Adiciona problemas elétricos se houver
      if (problemasEletricosSelecionados.length > 0) {
        console.log(
          "Adicionando problemas elétricos:",
          problemasEletricosSelecionados.length
        );
        doc.text("Problemas Elétricos:", 14, y);
        y += 6;
        problemasEletricosSelecionados.forEach((p) => {
          const problemaTexto = doc.splitTextToSize(`- ${p.problema}`, 180);
          if (y + problemaTexto.length * 6 > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(problemaTexto, 16, y);
          y += problemaTexto.length * 6;
          if (p.descricao) {
            const linhas = doc.splitTextToSize(p.descricao, 180);
            if (y + linhas.length * 6 > 280) {
              doc.addPage();
              y = 20;
            }
            doc.text(linhas, 18, y);
            y += linhas.length * 6;
          }
          if (p.fotos && p.fotos.length > 0) {
            p.fotos.forEach((foto) => {
              y = addImageWithCaption(
                doc,
                foto,
                p.descricao || p.problema,
                14,
                y
              );
            });
          }
        });
      }

      // Adiciona outros problemas se houver
      if (outrosProblemasSelecionados.length > 0) {
        console.log(
          "Adicionando outros problemas:",
          outrosProblemasSelecionados.length
        );
        doc.text("Outros Problemas:", 14, y);
        y += 6;
        outrosProblemasSelecionados.forEach((p) => {
          const problemaTexto = doc.splitTextToSize(`- ${p.problema}`, 180);
          if (y + problemaTexto.length * 6 > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(problemaTexto, 16, y);
          y += problemaTexto.length * 6;
          if (p.descricao) {
            const linhas = doc.splitTextToSize(p.descricao, 180);
            if (y + linhas.length * 6 > 280) {
              doc.addPage();
              y = 20;
            }
            doc.text(linhas, 18, y);
            y += linhas.length * 6;
          }
          if (p.fotos && p.fotos.length > 0) {
            p.fotos.forEach((foto) => {
              y = addImageWithCaption(
                doc,
                foto,
                p.descricao || p.problema,
                14,
                y
              );
            });
          }
        });
      }

      // Adiciona serviços recomendados se houver
      if (
        servicosRelatorioSelecionados.length > 0 ||
        servicosRelatorioManuais.length > 0
      ) {
        console.log(
          "Adicionando serviços recomendados:",
          servicosRelatorioSelecionados.length + servicosRelatorioManuais.length
        );
        doc.text("Serviços Recomendados:", 14, y);
        y += 6;
        servicosRelatorioSelecionados.forEach((s) => {
          const unidade =
            s.categoria === "Laudos"
              ? "m²"
              : s.categoria === "Passagem de Cabos e Eletrodutos"
              ? "m"
              : "un";
          const texto = `- ${s.nome} (${s.quantidade} ${unidade})${
            s.descricao ? " - " + s.descricao : ""
          }`;
          const linhasServico = doc.splitTextToSize(texto, 180);
          if (y + linhasServico.length * 6 > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(linhasServico, 16, y);
          y += linhasServico.length * 6;
          if (s.fotos && s.fotos.length > 0) {
            s.fotos.forEach((foto) => {
              y = addImageWithCaption(
                doc,
                foto,
                s.descricao || s.nome,
                14,
                y
              );
            });
          }
        });
        servicosRelatorioManuais.forEach((s) => {
          const texto = `- ${s.nome} (${s.quantidade} ${s.unidade || "un"})${
            s.descricao ? " - " + s.descricao : ""
          }`;
          const linhasServico = doc.splitTextToSize(texto, 180);
          if (y + linhasServico.length * 6 > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(linhasServico, 16, y);
          y += linhasServico.length * 6;
          if (s.fotos && s.fotos.length > 0) {
            s.fotos.forEach((foto) => {
              y = addImageWithCaption(
                doc,
                foto,
                s.descricao || s.nome,
                14,
                y
              );
            });
          }
        });
      }

      // Adiciona observações se houver
      if (descricaoRelatorio) {
        console.log("Adicionando observações");
        doc.text("Observações:", 14, y);
        y += 6;
        const linhas = doc.splitTextToSize(descricaoRelatorio, 180);
        if (y + linhas.length * 6 > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(linhas, 16, y);
        y += linhas.length * 6 + 4;
      }

      // Adiciona fotos do relatório se houver
      if (fotosRelatorio.length > 0) {
        console.log("Adicionando fotos do relatório:", fotosRelatorio.length);
        fotosRelatorio.forEach((foto) => {
          y = addImageWithCaption(doc, foto.src, foto.descricao, 14, y);
        });
      }

      console.log("Gerando PDF...");
      const pdf = doc.output("datauristring");

      console.log("Salvando arquivo...");
      salvarArquivo(
        cliente.nome,
        "relatorios",
        pdf,
        `relatorio-${cliente.nome || "cliente"}.pdf`
      );

      console.log("Baixando PDF...");
      doc.save(`relatorio-${cliente.nome || "cliente"}.pdf`);

      console.log("Relatório gerado com sucesso!");
      alert("Relatório gerado em PDF com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Verifique o console para mais detalhes.");
    }
  };

  // Função para limpar formulário
  const limparFormulario = () => {
    setCliente({ nome: "", contato: "", endereco: "" });
    setServicosSelecionados([]);
    setServicosManuais([]);
    setMateriais([]);
    setNovoMaterial({ descricao: "", quantidade: "", preco_unitario: "" });
    setObservacoesGerais("");
    setDespesasExtras([]);
    setNovaDespesa({ descricao: "", valor: "" });
    setArquivosObservacoes([]);
    setDesconto(0);
    setServicosRelatorioSelecionados([]);
    setServicosRelatorioManuais([]);
    setNovoServicoRelatorioManual({
      nome: "",
      descricao: "",
      quantidade: "",
      unidade: "un",
      fotos: [],
    });
    setProblemasEletricosSelecionados([]);
    setOutrosProblemasSelecionados([]);
    setDescricaoRelatorio("");
    setFotosRelatorio([]);
    setCurrentTab("cliente");
  };

  const acrescimoPorItem = calcularAcrescimoPorItem();
  const arquivosFiltrados = Object.entries(arquivos).filter(([nome]) =>
    nome.toLowerCase().includes(buscaArquivo.toLowerCase())
  );
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
      }),
    []
  );
  const totalServicosSelecionadosCount =
    servicosSelecionados.length + servicosManuais.length;
  const totalComplementosCount = materiais.length + despesasExtras.length;
  const totalProblemasSelecionados =
    problemasEletricosSelecionados.length +
    outrosProblemasSelecionados.length;
  const totalArquivosSalvos = Object.values(arquivos).reduce(
    (total, atual) => {
      const orcamentosSalvos = Array.isArray(atual?.orcamentos)
        ? atual.orcamentos.length
        : 0;
      const relatoriosSalvos = Array.isArray(atual?.relatorios)
        ? atual.relatorios.length
        : 0;
      return total + orcamentosSalvos + relatoriosSalvos;
    },
    0
  );
  const totalEstimadoComDesconto =
    calcularTotal() * (1 - (Number(desconto) || 0) / 100);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <ElectricBackground />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-950/60 to-amber-600/20"
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/5 shadow-xl shadow-emerald-500/20 ring-1 ring-emerald-400/40">
                  <img
                    src={logoRaizEletrica}
                    alt="Logo Raiz Elétrica"
                    className="h-16 w-16 object-contain drop-shadow-[0_10px_25px_rgba(16,185,129,0.35)]"
                  />
                </div>
                <div className="space-y-2 text-left">

                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                    Raiz Elétrica
                  </p>
                  <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Orçamento Elétrico e Relatório
                  </h1>
                  <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                    Sistema completo para geração de orçamentos, relatórios técnicos e organização de arquivos eletrônicos.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="min-w-[200px] rounded-xl border border-white/10 bg-white/10 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
                  onClick={() => setCurrentTab("orcamento")}
                >
                  <Calculator className="h-5 w-5" />
                  Ir para Orçamento
                </Button>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-emerald-500/10 backdrop-blur">
                <p className="text-sm text-slate-300">Serviços selecionados</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {totalServicosSelecionadosCount}
                </p>
                <p className="mt-1 text-xs text-slate-400">inclui cadastros manuais</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-emerald-500/10 backdrop-blur">
                <p className="text-sm text-slate-300">Estimativa com desconto</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">
                  {currencyFormatter.format(totalEstimadoComDesconto || 0)}
                </p>
                <p className="mt-1 text-xs text-slate-400">considerando materiais e mão de obra</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-emerald-500/10 backdrop-blur">
                <p className="text-sm text-slate-300">Itens complementares</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {totalComplementosCount}
                </p>
                <p className="mt-1 text-xs text-slate-400">materiais e despesas extras</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-emerald-500/10 backdrop-blur">
                <p className="text-sm text-slate-300">Arquivos organizados</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {totalArquivosSalvos}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {totalProblemasSelecionados} problemas registrados
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-16">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <Tabs
              value={currentTab}
              onValueChange={setCurrentTab}
              className="grid gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]"
            >
              <TabsList className="flex h-auto w-full flex-wrap items-stretch justify-start gap-2 rounded-3xl border border-white/10 bg-slate-900/60 p-2 shadow-xl shadow-emerald-500/10 backdrop-blur lg:sticky lg:top-28 lg:flex-col lg:h-fit lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:p-4">
                <TabsTrigger
                  value="cliente"
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-all duration-150 hover:border-emerald-400/40 hover:bg-emerald-500/5 hover:text-white sm:text-sm"
                >
                  <span className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    Cliente
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-300 transition group-data-[state=active]:bg-emerald-400/20 group-data-[state=active]:text-emerald-200">
                    1
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="servicos"
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-all duration-150 hover:border-emerald-400/40 hover:bg-emerald-500/5 hover:text-white sm:text-sm"
                >
                  <span className="flex items-center gap-3">
                    <Zap className="h-4 w-4" />
                    Serviços
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-300 transition group-data-[state=active]:bg-emerald-400/20 group-data-[state=active]:text-emerald-200">
                    2
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="extras"
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-all duration-150 hover:border-emerald-400/40 hover:bg-emerald-500/5 hover:text-white sm:text-sm"
                >
                  <span className="flex items-center gap-3">
                    <Plus className="h-4 w-4" />
                    Extras
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-300 transition group-data-[state=active]:bg-emerald-400/20 group-data-[state=active]:text-emerald-200">
                    3
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="orcamento"
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-all duration-150 hover:border-emerald-400/40 hover:bg-emerald-500/5 hover:text-white sm:text-sm"
                >
                  <span className="flex items-center gap-3">
                    <Calculator className="h-4 w-4" />
                    Orçamento
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-300 transition group-data-[state=active]:bg-emerald-400/20 group-data-[state=active]:text-emerald-200">
                    4
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="relatorio"
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-all duration-150 hover:border-emerald-400/40 hover:bg-emerald-500/5 hover:text-white sm:text-sm"
                >
                  <span className="flex items-center gap-3">
                    <Camera className="h-4 w-4" />
                    Relatório
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-300 transition group-data-[state=active]:bg-emerald-400/20 group-data-[state=active]:text-emerald-200">
                    5
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="arquivos"
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-all duration-150 hover:border-emerald-400/40 hover:bg-emerald-500/5 hover:text-white sm:text-sm"
                >
                  <span className="flex items-center gap-3">
                    <Folder className="h-4 w-4" />
                    Arquivos
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-300 transition group-data-[state=active]:bg-emerald-400/20 group-data-[state=active]:text-emerald-200">
                    6
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Aba Cliente */}
              <TabsContent value="cliente" className="space-y-6">
                <Card className="bg-slate-900/70 border-white/10 shadow-xl shadow-emerald-500/10 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Dados do Cliente</CardTitle>
                    <CardDescription>
                      Informe os dados do cliente para o orçamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={cliente.nome}
                        onChange={(e) =>
                          setCliente({ ...cliente, nome: e.target.value })
                        }
                        placeholder="Nome do cliente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contato">Contato</Label>
                      <Input
                        id="contato"
                        value={cliente.contato}
                        onChange={(e) =>
                          setCliente({ ...cliente, contato: e.target.value })
                        }
                        placeholder="Telefone ou email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={cliente.endereco}
                        onChange={(e) =>
                          setCliente({ ...cliente, endereco: e.target.value })
                        }
                        placeholder="Endereço do cliente"
                      />
                    </div>
                    <Button
                      onClick={() => setCurrentTab("servicos")}
                      disabled={!cliente.nome}
                      className="w-full rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-500/90"
                    >
                      Próximo: Selecionar Serviços
                    </Button>
                  </CardContent>
                </Card>

              </TabsContent>

          {/* Aba Serviços */}
          <TabsContent value="servicos" className="space-y-6">
            <Card className="bg-slate-900/70 border-white/10 shadow-xl shadow-emerald-500/10 backdrop-blur">
              <CardHeader>
                <CardTitle>Serviços Disponíveis</CardTitle>
                <CardDescription>
                  Selecione os serviços que serão executados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {categories.map((categoria) => (
                    <AccordionItem key={categoria} value={categoria}>
                      <AccordionTrigger className="text-lg font-semibold text-emerald-200">
                        {categoria}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3">
                          {services
                            .filter((s) => s.categoria === categoria)
                            .map((servico) => {
                              const selecionado = servicosSelecionados.find(
                                (s) => s.id === servico.id
                              );
                              return (
                                <div
                                  key={servico.id}
                                  className="rounded-2xl border border-white/5 bg-slate-900/80 p-4 shadow-inner shadow-black/30 transition hover:border-emerald-400/30 hover:shadow-emerald-500/10"
                                >
                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex items-start gap-3">
                                      <Checkbox
                                        checked={!!selecionado}
                                        onCheckedChange={() =>
                                          toggleServico(servico)
                                        }
                                      />
                                      <div className="flex-1 space-y-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="space-y-1">
                                            <h4 className="text-lg font-semibold text-white">
                                              {servico.nome}
                                            </h4>
                                            <p className="text-sm text-slate-300">
                                              {servico.descricao}
                                            </p>
                                          </div>
                                          <Badge
                                            variant="secondary"
                                            className="rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                                          >
                                            {servico.categoria === "Laudos"
                                              ? `${currencyFormatter.format(
                                                  servico.preco_padrao
                                                )}/m²`
                                              : currencyFormatter.format(
                                                  servico.preco_padrao
                                                )}
                                          </Badge>
                                        </div>

                                        {selecionado && (
                                          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                              <div className="space-y-1">
                                                <Label
                                                  htmlFor={`quantidade-${servico.id}`}
                                                >
                                                  {servico.categoria === "Laudos"
                                                    ? "Metros²"
                                                    : "Quantidade"}
                                                </Label>
                                                <Input
                                                  id={`quantidade-${servico.id}`}
                                                  type="number"
                                                  min="0"
                                                  step={
                                                    servico.categoria === "Laudos"
                                                      ? "0.01"
                                                      : "1"
                                                  }
                                                  value={selecionado.quantidade}
                                                  onChange={(e) =>
                                                    atualizarQuantidadeServico(
                                                      servico.id,
                                                      e.target.value
                                                    )
                                                  }
                                                  className="w-full max-w-[6rem] bg-slate-900/80"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <Label
                                                  htmlFor={`preco-${servico.id}`}
                                                >
                                                  Preço para este orçamento
                                                </Label>
                                                <Input
                                                  id={`preco-${servico.id}`}
                                                  type="number"
                                                  step="0.01"
                                                  value={selecionado.preco_unitario}
                                                  onChange={(e) =>
                                                    atualizarPrecoServico(
                                                      servico.id,
                                                      e.target.value
                                                    )
                                                  }
                                                  className="w-full max-w-[8rem] bg-slate-900/80"
                                                />
                                              </div>
                                              <div className="md:col-span-2">
                                                <Label
                                                  htmlFor={`obs-${servico.id}`}
                                                >
                                                  Observações
                                                </Label>
                                                <Textarea
                                                  id={`obs-${servico.id}`}
                                                  value={selecionado.observacoes}
                                                  onChange={(e) =>
                                                    atualizarObservacoesServico(
                                                      servico.id,
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="Observações específicas para este serviço"
                                                  rows={2}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex w-full items-center gap-3 lg:w-auto">
                                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1 text-sm font-semibold text-emerald-200">
                                        {currencyFormatter.format(servico.preco)}
                                      </span>
                                      <Button
                                        size="sm"
                                        onClick={() => adicionarServico(servico)}
                                        className="rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-500/90"
                                      >
                                        <Plus className="h-4 w-4" />
                                        Adicionar
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("cliente")}
                    className="h-11 rounded-lg border-white/30 bg-transparent text-white hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setCurrentTab("extras")}
                    className="h-11 flex-1 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-500/90"
                  >
                    Próximo: Serviços Extras
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Extras */}
          <TabsContent value="extras" className="space-y-6">
            {/* Serviços Manuais */}
            <Card className="bg-slate-900/70 border-white/10 shadow-xl shadow-emerald-500/10 backdrop-blur">
              <CardHeader>
                <CardTitle>Serviços Adicionais</CardTitle>
                <CardDescription>
                  Adicione serviços que não estão na lista padrão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="nome-manual">Nome do Serviço</Label>
                    <Input
                      id="nome-manual"
                      value={novoServicoManual.nome}
                      onChange={(e) =>
                        setNovoServicoManual({
                          ...novoServicoManual,
                          nome: e.target.value,
                        })
                      }
                      placeholder="Ex: Instalação especial"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao-manual">Descrição</Label>
                    <Input
                      id="descricao-manual"
                      value={novoServicoManual.descricao}
                      onChange={(e) =>
                        setNovoServicoManual({
                          ...novoServicoManual,
                          descricao: e.target.value,
                        })
                      }
                      placeholder="Descrição do serviço"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidade-manual">Qtd / m²</Label>
                    <Input
                      id="quantidade-manual"
                      type="number"
                      step="0.01"
                      value={novoServicoManual.quantidade}
                      onChange={(e) =>
                        setNovoServicoManual({
                          ...novoServicoManual,
                          quantidade: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preco-manual">Valor unitário</Label>
                    <div className="flex gap-2">
                      <Input
                        id="preco-manual"
                        type="number"
                        step="0.01"
                        value={novoServicoManual.preco_unitario}
                        onChange={(e) =>
                          setNovoServicoManual({
                            ...novoServicoManual,
                            preco_unitario: e.target.value,
                          })
                        }
                        placeholder="0.00"
                      />
                      <Button onClick={adicionarServicoManual} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {servicosManuais.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                      Serviços Adicionados
                    </h4>
                    {servicosManuais.map((servico) => (
                      <div
                        key={servico.id}
                        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1 text-sm text-slate-300">
                          <span className="text-base font-semibold text-white">
                            {servico.nome}
                          </span>
                          {servico.descricao && (
                            <span className="block text-xs text-slate-400">
                              {servico.descricao}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-left text-emerald-200 sm:text-right">

                          <Badge className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                            {`${servico.quantidade} x R$ ${servico.preco_unitario.toFixed(
                              2
                            )} = R$ ${(servico.quantidade * servico.preco_unitario).toFixed(2)}`}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removerServicoManual(servico.id)}
                            className="rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              </Card>

              {/* Despesas Extras */}
              <Card className="bg-slate-900/70 border-white/10 shadow-xl shadow-emerald-500/10 backdrop-blur">
                <CardHeader>
                  <CardTitle>Despesas Extras</CardTitle>
                  <CardDescription>
                    Custos adicionais como deslocamento e combustível
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="descricao-despesa">Descrição</Label>
                      <Input
                        id="descricao-despesa"
                        value={novaDespesa.descricao}
                        onChange={(e) =>
                          setNovaDespesa({
                            ...novaDespesa,
                            descricao: e.target.value,
                          })
                        }
                        placeholder="Ex: Deslocamento"
                      />
                    </div>
                    <div>
                      <Label htmlFor="valor-despesa">Valor</Label>
                      <div className="flex gap-2">
                        <Input
                          id="valor-despesa"
                          type="number"
                          step="0.01"
                          value={novaDespesa.valor}
                          onChange={(e) =>
                            setNovaDespesa({
                              ...novaDespesa,
                              valor: e.target.value,
                            })
                          }
                          placeholder="0.00"
                        />
                        <Button onClick={adicionarDespesaExtra} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {despesasExtras.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                        Despesas Adicionadas
                      </h4>
                      {despesasExtras.map((d) => (
                        <div
                          key={d.id}
                          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-sm text-slate-200">{d.descricao}</span>
                          <div className="flex items-center gap-3">
                            <Badge className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-left text-emerald-200 sm:text-right">
                              R$ {d.valor.toFixed(2)}
                            </Badge>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removerDespesaExtra(d.id)}
                              className="rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Materiais */}
              <Card className="bg-slate-900/70 border-white/10 shadow-xl shadow-emerald-500/10 backdrop-blur">
                <CardHeader>
                  <CardTitle>Materiais</CardTitle>
                <CardDescription>
                  Adicione materiais necessários para o serviço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="descricao-material">Descrição</Label>
                    <Input
                      id="descricao-material"
                      value={novoMaterial.descricao}
                      onChange={(e) =>
                        setNovoMaterial({
                          ...novoMaterial,
                          descricao: e.target.value,
                        })
                      }
                      placeholder="Ex: Fio 2,5mm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidade-material">Quantidade</Label>
                    <Input
                      id="quantidade-material"
                      type="number"
                      value={novoMaterial.quantidade}
                      onChange={(e) =>
                        setNovoMaterial({
                          ...novoMaterial,
                          quantidade: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor-material">Valor unitário</Label>
                    <div className="flex gap-2">
                      <Input
                        id="valor-material"
                        type="number"
                        step="0.01"
                        value={novoMaterial.preco_unitario}
                        onChange={(e) =>
                          setNovoMaterial({
                            ...novoMaterial,
                            preco_unitario: e.target.value,
                          })
                        }
                        placeholder="0.00"
                      />
                      <Button onClick={adicionarMaterial} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {materiais.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                      Materiais Adicionados
                    </h4>
                    {materiais.map((material) => (
                      <div
                        key={material.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-sm text-slate-200">{material.descricao}</span>
                        <div className="flex items-center gap-3">
                          <Badge className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-left text-emerald-200 sm:text-right">
                            {`${material.quantidade} x R$ ${material.preco_unitario.toFixed(2)} = R$ ${(material.quantidade * material.preco_unitario).toFixed(2)}`}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removerMaterial(material.id)}
                            className="rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observações Gerais */}
            <Card className="bg-slate-900/70 border-white/10 shadow-xl shadow-emerald-500/10 backdrop-blur">
              <CardHeader>
                <CardTitle>Observações Gerais</CardTitle>
                <CardDescription>
                  Adicione observações gerais sobre o orçamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={observacoesGerais}
                  onChange={(e) => setObservacoesGerais(e.target.value)}
                  placeholder="Observações gerais sobre o orçamento..."
                  rows={4}
                />
                <div className="mt-4 space-y-2">
                  <Label htmlFor="arquivos-observacoes">Anexos</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="arquivos-observacoes"
                      type="file"
                      multiple
                      onChange={handleUploadObservacoes}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handleUploadObservacoes}
                    />
                  </div>
                  {arquivosObservacoes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {arquivosObservacoes.map((arq) =>
                        arq.tipo.startsWith("image/") ? (
                          <img
                            key={arq.id}
                            src={arq.base64}
                            alt={arq.nome}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : (
                          <span
                            key={arq.id}
                            className="text-sm text-emerald-200 underline"
                          >
                            {arq.nome}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setCurrentTab("servicos")}
                className="h-11 rounded-lg border-white/30 bg-transparent text-white hover:border-emerald-400/40 hover:bg-emerald-500/10"
              >
                Voltar
              </Button>
              <Button
                onClick={() => setCurrentTab("orcamento")}
                className="h-11 flex-1 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-500/90"
              >
                Finalizar: Ver Orçamento
              </Button>
            </div>
          </TabsContent>

          {/* Aba Orçamento */}
          <TabsContent value="orcamento" className="space-y-6">
            <Card className="bg-slate-900/70 border-white/10 shadow-2xl shadow-emerald-500/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Orçamento Final
                </CardTitle>
                <CardDescription>Resumo do orçamento gerado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dados do Cliente */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                    Cliente
                  </h3>
                  <div className="mt-3 space-y-1 text-sm text-slate-200">
                    <p>
                      <span className="font-semibold text-white">Nome:</span> {cliente.nome}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Contato:</span> {cliente.contato}
                    </p>
                    {cliente.endereco && (
                      <p>
                        <span className="font-semibold text-white">Endereço:</span> {cliente.endereco}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Serviços Selecionados */}
                {servicosSelecionados.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                      Serviços Selecionados
                    </h3>
                    <div className="mt-3 space-y-3">
                      {servicosSelecionados.map((servico) => {
                        const precoFinal =
                          servico.preco_unitario + acrescimoPorItem;
                        return (
                          <div
                            key={servico.id}
                            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/80 p-4 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="flex-1 space-y-2">
                              <p className="text-base font-semibold text-white">
                                {servico.nome}
                              </p>
                              <p className="text-sm text-slate-300">
                                {servico.descricao}
                              </p>
                              {servico.observacoes && (
                                <p className="text-xs text-emerald-200">
                                  Observações: {servico.observacoes}
                                </p>
                              )}
                            </div>
                            <Badge className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-left text-emerald-200 sm:text-right">
                              {servico.categoria === "Laudos"
                                ? `${servico.quantidade} m² x R$ ${precoFinal.toFixed(2)} = R$ ${(precoFinal * servico.quantidade).toFixed(2)}`
                                : `${servico.quantidade}x R$ ${precoFinal.toFixed(2)} = R$ ${(precoFinal * servico.quantidade).toFixed(2)}`}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Serviços Manuais */}
                {servicosManuais.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                      Serviços Adicionais
                    </h3>
                    <div className="mt-3 space-y-3">
                      {servicosManuais.map((servico) => {
                        const precoFinal =
                          servico.preco_unitario + acrescimoPorItem;
                        return (
                          <div
                            key={servico.id}
                            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/80 p-4 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="space-y-1">
                              <p className="text-base font-semibold text-white">
                                {servico.nome}
                              </p>
                              {servico.descricao && (
                                <p className="text-sm text-slate-300">
                                  {servico.descricao}
                                </p>
                              )}
                            </div>
                            <Badge className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-left text-emerald-200 sm:text-right">
                              {`${servico.quantidade} x R$ ${precoFinal.toFixed(2)} = R$ ${(servico.quantidade * precoFinal).toFixed(2)}`}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Materiais */}
                {materiais.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                      Materiais
                    </h3>
                    <div className="mt-3 space-y-3">
                      {materiais.map((material) => (
                        <div
                          key={material.id}
                          className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/80 p-4 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div className="flex-1 text-sm text-slate-200">
                            <p className="font-semibold text-white">{material.descricao}</p>
                          </div>
                          <Badge className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-left text-emerald-200 sm:text-right">
                            {`${material.quantidade} x R$ ${material.preco_unitario.toFixed(2)} = R$ ${(material.quantidade * material.preco_unitario).toFixed(2)}`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Despesas Extras */}
                {despesasExtras.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                      Despesas Extras
                    </h3>
                    <div className="mt-3 space-y-3">
                      {despesasExtras.map((d) => (
                        <div
                          key={d.id}
                          className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-sm text-slate-200">{d.descricao}</span>
                          <Badge className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-left text-emerald-200 sm:text-right">
                            R$ {d.valor.toFixed(2)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações Gerais */}
                {observacoesGerais && (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                      Observações Gerais
                    </h3>
                    <p className="mt-3 text-sm text-slate-200">
                      {observacoesGerais}
                    </p>
                  </div>
                )}

                {arquivosObservacoes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Anexos:</h3>
                    <div className="flex flex-wrap gap-3">
                      {arquivosObservacoes.map((arq) =>
                        arq.tipo.startsWith("image/") ? (
                          <img
                            key={arq.id}
                            src={arq.base64}
                            alt={arq.nome}
                            className="h-24 w-24 rounded-xl object-cover shadow-inner shadow-black/30"
                          />
                        ) : (
                          <a
                            key={arq.id}
                            href={arq.base64}
                            download={arq.nome}
                            className="text-sm text-emerald-200 underline"
                          >
                            {arq.nome}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Desconto */}
                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="desconto" className="text-slate-200">
                      Desconto (%)
                    </Label>
                    <Input
                      id="desconto"
                      type="number"
                      className="w-24 bg-slate-900/80"
                      value={desconto}
                      onChange={(e) =>
                        setDesconto(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                {/* Totais */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/60 to-emerald-900/20 p-6 text-right shadow-inner shadow-emerald-500/10">
                  <div className="space-y-2 text-sm text-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Subtotal Mão de Obra</span>
                      <span>{currencyFormatter.format(calcularSubtotalMaoDeObra())}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subtotal Materiais</span>
                      <span>{currencyFormatter.format(calcularSubtotalMateriais())}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-lg font-semibold text-emerald-200">
                    <span>Total estimado</span>
                    <span>
                      {currencyFormatter.format(
                        calcularTotal() * (1 - desconto / 100)
                      )}
                    </span>
                  </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-lg font-semibold text-emerald-200">
                    <span>Total estimado</span>
                    <span>
                      {currencyFormatter.format(
                        calcularTotal() * (1 - desconto / 100)
                      )}
                    </span>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Atualizado em {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("extras")}
                    className="h-11 rounded-lg border-white/30 bg-transparent text-white hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={gerarOrcamento}
                    className="h-11 flex-1 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-500/90 sm:flex-none sm:px-8"
                    disabled={!cliente.nome}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar Orçamentos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={limparFormulario}
                    className="h-11 rounded-lg border-white/30 bg-transparent text-white hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    Novo Orçamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Relatório */}
          <TabsContent value="relatorio" className="space-y-6">
            <Card className="bg-slate-900/70 border-white/10 shadow-xl shadow-emerald-500/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Serviços Necessários
                </CardTitle>
                <CardDescription>
                  Selecione os serviços recomendados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="multiple" className="w-full">
                  {categories.map((categoria) => (
                    <AccordionItem key={categoria} value={categoria}>
                      <AccordionTrigger className="font-semibold text-emerald-200">
                        {categoria}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-4">
                          {services
                            .filter((s) => s.categoria === categoria)
                            .map((servico) => {
                              const selecionado =
                                servicosRelatorioSelecionados.find(
                                  (s) => s.id === servico.id
                                );
                              const isLaudo = servico.categoria === "Laudos";
                              const isCabo =
                                servico.categoria ===
                                "Passagem de Cabos e Eletrodutos";
                              const label = isLaudo
                                ? "Metros²"
                                : isCabo
                                ? "Metros"
                                : "Quantidade";
                              return (
                                <div
                                  key={servico.id}
                                  className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-inner shadow-black/30 transition hover:border-emerald-400/30 hover:shadow-emerald-500/10"
                                >
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      checked={!!selecionado}
                                      onCheckedChange={() =>
                                        toggleServicoRelatorio(servico)
                                      }
                                    />
                                    <div className="space-y-1">
                                      <h4 className="text-base font-semibold text-white">
                                        {servico.nome}
                                      </h4>
                                      {servico.descricao && (
                                        <p className="text-sm text-slate-300">
                                          {servico.descricao}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {selecionado && (
                                    <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                                      <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1">
                                          <Label htmlFor={`quantidade-rel-${servico.id}`}>
                                            {label}
                                          </Label>
                                          <Input
                                            id={`quantidade-rel-${servico.id}`}
                                            type="number"
                                            min="0"
                                            step={isLaudo || isCabo ? "0.01" : "1"}
                                            value={selecionado.quantidade}
                                            onChange={(e) =>
                                              atualizarQuantidadeServicoRelatorio(
                                                servico.id,
                                                e.target.value
                                              )
                                            }
                                            className="bg-slate-900/80"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`descricao-servico-rel-${servico.id}`}>
                                            Descrição
                                          </Label>
                                          <Textarea
                                            id={`descricao-servico-rel-${servico.id}`}
                                            value={selecionado.descricao}
                                            onChange={(e) =>
                                              atualizarDescricaoServicoRelatorio(
                                                servico.id,
                                                e.target.value
                                              )
                                            }
                                            rows={2}
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`foto-servico-rel-${servico.id}`}>
                                          Foto
                                        </Label>
                                        <div className="flex flex-col gap-2 md:flex-row">
                                          <Input
                                            id={`foto-servico-rel-${servico.id}`}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            multiple
                                            onChange={(e) =>
                                              adicionarFotoServicoRelatorio(
                                                servico.id,
                                                e
                                              )
                                            }
                                            className="bg-slate-900/80"
                                          />
                                          <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) =>
                                              adicionarFotoServicoRelatorio(
                                                servico.id,
                                                e
                                              )
                                            }
                                            className="bg-slate-900/80"
                                          />
                                        </div>
                                      </div>
                                      {selecionado.fotos && selecionado.fotos.length > 0 && (
                                        <div className="flex flex-wrap gap-3">
                                          {selecionado.fotos.map((foto, idx) => (
                                            <img
                                              key={idx}
                                              src={foto}
                                              alt="Evidência"
                                              className="w-full max-w-xs rounded-xl object-cover shadow-inner shadow-black/30"
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                    Adicionar Serviço Manual
                  </h3>
                  <div className="grid gap-3">
                    <Label htmlFor="nome-servico-relatorio">Nome</Label>
                    <Input
                      id="nome-servico-relatorio"
                      value={novoServicoRelatorioManual.nome}
                      onChange={(e) =>
                        setNovoServicoRelatorioManual({
                          ...novoServicoRelatorioManual,
                          nome: e.target.value,
                        })
                      }
                      className="bg-slate-900/80"
                    />
                    <Label htmlFor="descricao-servico-relatorio">
                      Descrição
                    </Label>
                    <Input
                      id="descricao-servico-relatorio"
                      value={novoServicoRelatorioManual.descricao}
                      onChange={(e) =>
                        setNovoServicoRelatorioManual({
                          ...novoServicoRelatorioManual,
                          descricao: e.target.value,
                        })
                      }
                      className="bg-slate-900/80"
                    />
                    <Label htmlFor="quantidade-servico-relatorio">
                      Quantidade ou m²
                    </Label>
                    <Input
                      id="quantidade-servico-relatorio"
                      type="number"
                      value={novoServicoRelatorioManual.quantidade}
                      onChange={(e) =>
                        setNovoServicoRelatorioManual({
                          ...novoServicoRelatorioManual,
                          quantidade: e.target.value,
                        })
                      }
                      className="bg-slate-900/80"
                    />
                    <Label htmlFor="unidade-servico-relatorio">Unidade</Label>
                    <Input
                      id="unidade-servico-relatorio"
                      value={novoServicoRelatorioManual.unidade}
                      onChange={(e) =>
                        setNovoServicoRelatorioManual({
                          ...novoServicoRelatorioManual,
                          unidade: e.target.value,
                        })
                      }
                      className="bg-slate-900/80"
                    />
                    <Label htmlFor="foto-servico-relatorio">Fotos</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="foto-servico-relatorio"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={handleFotoNovoServicoRelatorioManual}
                        className="bg-slate-900/80"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFotoNovoServicoRelatorioManual}
                        className="bg-slate-900/80"
                      />
                    </div>
                    {novoServicoRelatorioManual.fotos &&
                      novoServicoRelatorioManual.fotos.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {novoServicoRelatorioManual.fotos.map((foto, idx) => (
                            <img
                              key={idx}
                              src={foto}
                              alt="Pré-visualização"
                              className="w-full max-w-xs rounded-xl object-cover shadow-inner shadow-black/30"
                            />
                          ))}
                        </div>
                      )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={adicionarServicoRelatorioManual}
                    className="h-11 rounded-lg border-white/30 bg-transparent text-white hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    Adicionar
                  </Button>

                  {servicosRelatorioManuais.length > 0 && (
                    <div className="space-y-3">
                      {servicosRelatorioManuais.map((servico) => (
                        <div
                          key={servico.id}
                          className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm font-semibold text-white">{`${servico.nome} - ${servico.quantidade} ${servico.unidade}`}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removerServicoRelatorioManual(servico.id)
                              }
                              className="rounded-full text-emerald-200 hover:bg-emerald-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {servico.descricao && (
                            <p className="text-sm text-slate-300">
                              {servico.descricao}
                            </p>
                          )}
                          {servico.fotos && servico.fotos.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {servico.fotos.map((foto, idx) => (
                                <img
                                  key={idx}
                                  src={foto}
                                  alt="Evidência"
                                  className="w-full max-w-xs rounded-xl object-cover shadow-inner shadow-black/30"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 border-white/10 shadow-xl shadow-emerald-500/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Registro de Problemas
                </CardTitle>
                <CardDescription>
                  Capture fotos e descreva problemas encontrados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="problemas-eletricos">
                    <AccordionTrigger className="font-semibold text-emerald-200">
                      Problemas Elétricos
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4">
                        {problemasEletricos.map((p) => {
                          const selecionado =
                            problemasEletricosSelecionados.find(
                              (pe) => pe.problema === p
                            );
                          return (
                            <div
                              key={p}
                              className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4"
                            >
                              <Label className="flex items-center gap-3 text-sm text-slate-200">
                                <Checkbox
                                  checked={!!selecionado}
                                  onCheckedChange={() =>
                                    toggleSelecao(
                                      p,
                                      problemasEletricosSelecionados,
                                      setProblemasEletricosSelecionados
                                    )
                                  }
                                />
                                {p}
                              </Label>
                              {selecionado && (
                                <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                                  <Textarea
                                    value={selecionado.descricao}
                                    onChange={(e) =>
                                      atualizarDescricaoProblema(
                                        p,
                                        e.target.value,
                                        problemasEletricosSelecionados,
                                        setProblemasEletricosSelecionados
                                      )
                                    }
                                    placeholder="Descrição do problema"
                                    rows={2}
                                  />
                                  <div className="flex flex-col gap-2 md:flex-row">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      multiple
                                      onChange={(e) =>
                                        adicionarFotoProblema(
                                          p,
                                          e,
                                          problemasEletricosSelecionados,
                                          setProblemasEletricosSelecionados
                                        )
                                      }
                                      className="bg-slate-900/80"
                                    />
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={(e) =>
                                        adicionarFotoProblema(
                                          p,
                                          e,
                                          problemasEletricosSelecionados,
                                          setProblemasEletricosSelecionados
                                        )
                                      }
                                      className="bg-slate-900/80"
                                    />
                                  </div>
                                  {selecionado.fotos && selecionado.fotos.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                      {selecionado.fotos.map((foto, idx) => (
                                        <img
                                          key={idx}
                                          src={foto}
                                          alt="Evidência"
                                          className="w-full max-w-xs rounded-xl object-cover shadow-inner shadow-black/30"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="outros-problemas">
                    <AccordionTrigger className="font-semibold text-emerald-200">
                      Outros Problemas
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4">
                        {outrosProblemas.map((p) => {
                          const selecionado = outrosProblemasSelecionados.find(
                            (op) => op.problema === p
                          );
                          return (
                            <div
                              key={p}
                              className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4"
                            >
                              <Label className="flex items-center gap-3 text-sm text-slate-200">
                                <Checkbox
                                  checked={!!selecionado}
                                  onCheckedChange={() =>
                                    toggleSelecao(
                                      p,
                                      outrosProblemasSelecionados,
                                      setOutrosProblemasSelecionados
                                    )
                                  }
                                />
                                {p}
                              </Label>
                              {selecionado && (
                                <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                                  <Textarea
                                    value={selecionado.descricao}
                                    onChange={(e) =>
                                      atualizarDescricaoProblema(
                                        p,
                                        e.target.value,
                                        outrosProblemasSelecionados,
                                        setOutrosProblemasSelecionados
                                      )
                                    }
                                    placeholder="Descrição do problema"
                                    rows={2}
                                  />
                                  <div className="flex flex-col gap-2 md:flex-row">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      multiple
                                      onChange={(e) =>
                                        adicionarFotoProblema(
                                          p,
                                          e,
                                          outrosProblemasSelecionados,
                                          setOutrosProblemasSelecionados
                                        )
                                      }
                                      className="bg-slate-900/80"
                                    />
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={(e) =>
                                        adicionarFotoProblema(
                                          p,
                                          e,
                                          outrosProblemasSelecionados,
                                          setOutrosProblemasSelecionados
                                        )
                                      }
                                      className="bg-slate-900/80"
                                    />
                                  </div>
                                  {selecionado.fotos && selecionado.fotos.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                      {selecionado.fotos.map((foto, idx) => (
                                        <img
                                          key={idx}
                                          src={foto}
                                          alt="Evidência"
                                          className="w-full max-w-xs rounded-xl object-cover shadow-inner shadow-black/30"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div>
                  <Label htmlFor="descricao-relatorio">
                    Descrição Adicional
                  </Label>
                  <Textarea
                    id="descricao-relatorio"
                    value={descricaoRelatorio}
                    onChange={(e) => setDescricaoRelatorio(e.target.value)}
                    placeholder="Descreva detalhes adicionais"
                    rows={3}
                  />
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="foto-relatorio">Capturar Foto</Label>
                    <Input
                      id="foto-relatorio"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={adicionarFotoRelatorio}
                      className="bg-slate-900/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foto-relatorio-galeria">
                      Selecionar da Galeria
                    </Label>
                    <Input
                      id="foto-relatorio-galeria"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={adicionarFotoRelatorio}
                      className="bg-slate-900/80"
                    />
                  </div>
                  {fotosRelatorio.map((foto) => (
                    <div
                      key={foto.id}
                      className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4"
                    >
                      <img
                        src={foto.src}
                        alt="Evidência"
                        className="w-full max-w-md rounded-xl object-cover shadow-inner shadow-black/30"
                      />
                      <Textarea
                        value={foto.descricao}
                        onChange={(e) =>
                          atualizarDescricaoFoto(foto.id, e.target.value)
                        }
                        placeholder="Descrição da foto"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    onClick={gerarRelatorio}
                    className="h-11 flex-1 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-500/90 sm:flex-none sm:px-8"
                    disabled={!cliente.nome}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                  <Button
                    onClick={() => {
                      console.log("=== TESTE RÁPIDO ===");
                      console.log("Cliente:", cliente);
                      console.log(
                        "Problemas elétricos:",
                        problemasEletricosSelecionados
                      );
                      console.log(
                        "Outros problemas:",
                        outrosProblemasSelecionados
                      );
                      console.log(
                        "Serviços relatório:",
                        servicosRelatorioSelecionados
                      );
                      console.log(
                        "Serviços manuais:",
                        servicosRelatorioManuais
                      );
                      console.log("Descrição:", descricaoRelatorio);
                      console.log("Fotos:", fotosRelatorio);
                      alert(
                        "Verifique o console para ver os dados do relatório"
                      );
                    }}
                    variant="outline"
                    size="sm"
                    className="h-11 rounded-lg border-white/30 bg-transparent text-white hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    Teste
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="arquivos" className="space-y-6">
            <Input
              placeholder="Pesquisar por nome"
              value={buscaArquivo}
              onChange={(e) => setBuscaArquivo(e.target.value)}
              className="bg-slate-900/80"
            />
            {arquivosFiltrados.length === 0 ? (
              <p className="text-sm text-slate-300">Nenhum documento salvo.</p>
            ) : (
              arquivosFiltrados.map(([nome, dados]) => (
                <Card
                  key={nome}
                  className="bg-slate-900/70 border-white/10 shadow-xl shadow-emerald-500/10 backdrop-blur"
                >
                  <CardHeader>
                    <CardTitle>{nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold">Orçamentos</h3>
                      {dados.orcamentos?.length ? (
                        <ul className="space-y-2">
                          {dados.orcamentos.map((o, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <a
                                href={o.pdf}
                                download={o.nome}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-sm text-emerald-200 underline"
                              >
                                {o.data}
                              </a>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerArquivo(nome, "orcamentos", i)}
                                className="rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400">
                          Nenhum orçamento salvo
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">Relatórios</h3>
                      {dados.relatorios?.length ? (
                        <ul className="space-y-2">
                          {dados.relatorios.map((r, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <a
                                href={r.pdf}
                                download={r.nome}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-sm text-emerald-200 underline"
                              >
                                {r.data}
                              </a>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerArquivo(nome, "relatorios", i)}
                                className="rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400">
                          Nenhum relatório salvo
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  </div>
</div>
  );
}

export default App;
